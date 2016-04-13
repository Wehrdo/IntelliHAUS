#include "Server.hpp"


Hub::Server::Server(int homeID, string url, const string& username,
			const string& password,
			function<void(const vector<ServerUpdate>&)> cbUpdate)
			: http(url), userName(username), password(password) {
	this->homeID = homeID;
	this->cbUpdate = cbUpdate;

	Connect(cbConnect);
}

Hub::Server::~Server() {

}

void Hub::Server::ThreadRoutine() {
	while(1) {
		ioService.run();
		ioService.reset();

		this_thread::wait_for(chrono::milliseconds(10));
	}
}

void cbConnect() {
	ioService.post([this](){
		Authenticate([this](const Exception& e) {
			cbAuthenticate(e);
		}
	});
}

int Hub::Server::Authenticate(function<void(const Exception& e)> cb) {
	HTTP::Message authMsg("Connection: keep-alive\r\nContent-Type: application/json\r\n",
				string("{\"username\": \"") + username + "\",\r\n"
				"\"password\": \"" + password + "\"}");

	if(!isConnected) {
		cb(Exception(Error_Code::SERVER_NOT_CONNECTED,
				"Server::Authenticate error: not connected"));

		return;
	}

	auto authResp = http.Post("/authenticate", authMsg,
				[this](const Message& msg) {
					cbAuthenticate(msg);
				});
}

	Json::Value jsonResp;
	stringstream jsonStream(authResp.GetBody());

	jsonStream >> jsonResp;

	bool success;

	try {
		success = jsonResp.get("success", false).asBool();
	}
	catch(Exception &e) {
		cb(e);

		return;
	}
	catch(exception &e) {
		cout << "Authenticate exception caught: " << e.what() << endl;
		return -1;
	}

	if(!success) {
		throw Exception(Error_Code::SERVER_ERROR_NOT_SPECIFIED,
				"Authenticate exception: " +
			jsonResp.get("error", "Unspecified error").asString());
	}

	accessToken = jsonResp.get("token", "").asString();

	LongPoll();

	return 0;
}

int Hub::Server::CreateUser(const string& username, const string& password,
				const string& firstName, const string&lastName,
				const string& email) {
	Json::Value jsonBody;
	stringstream bodyStream;

	jsonBody["username"] = username;
	jsonBody["password"] = password;
	jsonBody["firstname"] = firstName;
	jsonBody["lastname"] = lastName;
	jsonBody["email"] = email;

	bodyStream << jsonBody;

	string header = "Connection: keep-alive\r\nContent-Type: application/json\r\n";
	HTTP::Message msg(header, bodyStream.str());

	cout << "Header:\n" << msg.ToString() << endl;

	auto userResp = http.PostBlocking("/signup", msg);

	cout << "Server response:\n" << userResp.ToString() << endl;

	Json::Value jsonResp;
	stringstream streamResp(userResp.GetBody());

	streamResp >> jsonResp;

	bool success;

	try {
		success = jsonResp.get("success", false).asBool();
	}
	catch(exception &e) {
		cout << "CreateUser exception caught: " << e.what() << endl;
		return -1;
	}

	if(!success) {
		throw Exception(Error_Code::SERVER_ERROR_NOT_SPECIFIED,
			"Create User exception: " +
			jsonResp.get("error", "Unspecified error").asString());
	}

	return 0;
}

int Hub::Server::CreateHome(const string& homeName) {
	if(accessToken.length() == 0) {
		throw Exception(Error_Code::SERVER_ERROR_NOT_AUTHENTICATED,
					"Create Home exception: "
					"authentication needed");
	}

	Json::Value jsonParams;
	stringstream bodyStream;

	jsonParams["name"] = homeName;

	bodyStream << jsonParams;

	string header = "Connection: keep-alive\r\n"
			"Content-Type: application/json\r\n"
			"x-access-token:" + accessToken + "\r\n";
	HTTP::Message msg(header, bodyStream.str());

	cout << "User message:\r\n" << msg.ToString() << endl;

	auto userResp = http.PostBlocking("/api/home", msg);

	cout << "Server response:\n" << userResp.ToString() << endl;

	Json::Value jsonResp;
	stringstream streamResp(userResp.GetBody());

	streamResp >> jsonResp;

	return 0;
}

int Hub::Server::GetHomeID(const string& homeName) {
	if(accessToken.length() == 0) {
		throw Exception(Error_Code::SERVER_ERROR_NOT_AUTHENTICATED,
					"GetHomeID exception: "
					"authentication needed");
	}

	string header = "Connection: keep-alive\r\n"
			"x-access-token: " + accessToken + "\r\n";

	auto msg = http.GetBlocking("/api/home", header);

	Json::Value jsonResp;
	stringstream streamResp(msg.GetBody());

	streamResp >> jsonResp;

	bool success = jsonResp.get("success", false).asBool();

	if(!success) {
		throw Exception(Error_Code::SERVER_ERROR_NOT_AUTHENTICATED,
				"GetHomeID exception: " +
				jsonResp.get("error", "unspecified error").asString());
	}

	Json::Value jsonHomes = jsonResp["homes"];

	if(!jsonHomes.isArray()) {
		throw Exception(Error_Code::SERVER_ERROR_INVALID_JSON_RESPONSE,
				"GetHomeID exception: "
				"JSON homes array not given");
	}

	int homeID = -1;

	for(auto &home : jsonHomes) {
		int id = home.get("id", "-1").asInt();
		string name = home.get("name", "").asString();

		if(name == homeName) {
			homeID = id;
			break;
		}
	}

	return homeID;
}

int Hub::Server::CreateDatastream(const string& name, Datatype datatype) {
	Json::Value jsonRequest;
	stringstream streamRequest;

	jsonRequest["name"] = name;

	switch(datatype) {
	case DISCRETE:
		jsonRequest["datatype"] = "discrete";
		break;
	case BINARY:
		jsonRequest["datatype"] = "binary";
		break;
	case CONTINUOUS:
	default:
		jsonRequest["datatype"] = "continuous";
		break;
	}

	streamRequest << jsonRequest;
	string header = "Connection: keep-alive\r\n"
			"Content-Type: application/json\r\n"
			"x-access-token: " + accessToken + "\r\n";

	HTTP::Message msg(header, streamRequest.str());

	auto msgResp = http.PostBlocking("/api/datastream", msg);

	Json::Value jsonResp;
	stringstream streamResp(msgResp.GetBody());

	streamResp >> jsonResp;

	bool success = jsonResp.get("success", "false").asBool();

	if(!success) {
		throw Exception(Error_Code::SERVER_ERROR_NOT_SPECIFIED,
			"CreateDatastream exception: " +
			jsonResp.get("error", "No error specified").asString());
	}

	return jsonResp.get("id", "-1").asInt();
}

int Hub::Server::CreateNode(int homeID, const string& name,
			Datatype datatype, const string& outputName,
			int streamID) {
	Json::Value jsonRequest;
	stringstream streamRequest;

	jsonRequest["homeid"] = homeID;
	jsonRequest["name"] = name;
	jsonRequest["outputname"] = outputName;
	jsonRequest["datastreamid"] = streamID;

	switch(datatype) {
	case DISCRETE:
		jsonRequest["outputtype"] = "discrete";
		break;
	case BINARY:
		jsonRequest["outputtype"] = "binary";
		break;
	case CONTINUOUS:
	default:
		jsonRequest["outputtype"] = "continuous";
		break;
	}

	streamRequest << jsonRequest;
	string header = "Connection: keep-alive\r\n"
			"Content-Type: application/json\r\n"
			"x-access-token: " + accessToken + "\r\n";

	HTTP::Message msg(header, streamRequest.str());

//	cout << "HTTP Request:\r\n" << msg.ToString() << endl;

	auto msgResp = http.PostBlocking("/api/node", msg);

	Json::Value jsonResp;
	stringstream streamResp(msgResp.GetBody());

	streamResp >> jsonResp;

	bool success = jsonResp.get("success", "false").asBool();

//	cout << msgResp.ToString() << endl;

	if(!success) {
		throw Exception(Error_Code::SERVER_ERROR_NOT_SPECIFIED,
			"CreateNode exception: " +
			jsonResp.get("error", "No error specified").asString());
	}

	return jsonResp.get("id", "-1").asInt();
}

int Hub::Server::SendDatapoint(int nodeID, float data) {
	Json::Value jsonRequest;
	stringstream streamRequest;

	jsonRequest["nodeid"] = nodeID;
	jsonRequest["data"] = data;

	streamRequest << jsonRequest;

	string header = "Connection: keep-alive\r\n"
			"Content-Type: application/json\r\n"
			"x-access-token: " + accessToken + "\r\n";

	HTTP::Message msg(header, streamRequest.str());

	auto cbLambda = [](const HTTP::Message& msgResp) {
		Json::Value jsonResp;
		stringstream streamResp(msgResp.GetBody());

		streamResp >> jsonResp;

		bool success;

		try {
			success = jsonResp.get("success", "false").asBool();
		}
		catch(exception &e) {
			cout << "SendDatapoint exception caught: " << e.what() << endl;
			return -1;
		}
		catch(...) {
			cout << "SendDatapoint non std::exception"
				"exception caught." << endl;
		}

		if(!success) {
			cout << "SendDatapoint exception: " <<
				jsonResp.get("error", "No error specified")
					.asString();

			//TODO: Check error, retry
		}
		else
			cout << "SendDatapoint complete." << endl;
	};

	http.Post("/api/datapoint", msg, cbLambda);

	return 0;
}

void Hub::Server::LongPoll() {
	string header = "Connection: keep-alive\r\n"
			"Content-Type: application/json\r\n"
			"x-access-token: " + accessToken + "\r\n"
			"homeid: " + std::to_string(homeID) + "\r\n";

	http.Get("/api/rule/updates", header, [this](const Hub::HTTP::Message& msg){cbLongPoll(msg);});
}

void Hub::Server::cbLongPoll(const Hub::HTTP::Message& msg) {

	Json::Value jsonResp;

	stringstream streamResp(msg.GetBody());
	stringstream testStream;

	streamResp >> jsonResp;

	bool success;

	try {
		success = jsonResp.get("success", "false").asBool();
	}
	catch(exception &e) {
		cout << "LongPoll exception: " << e.what() << endl;
		return;
	}

	if(!success) {
		cout << "LongPoll error." << endl;
		return;
	}

	Json::Value updates = jsonResp["updates"];

	int updateCount = 0;
	vector<ServerUpdate> serverUpdates;

	for(auto &update : updates) {
		updateCount++;

		ServerUpdate serverUpdate;

		serverUpdate.nodeID = update.get("nodeId", "0").asInt();

		Json::Value values = update["data"];

		for(auto &value : values) {
			float f;
			serverUpdate.values.push_back(f = value.asFloat());
			cout << "Float: " << f << endl;
		}

		serverUpdates.push_back(serverUpdate);
	}

	cout << "Long Poll response: " << updateCount << " updates." << endl;

	if(updateCount > 0)
		cbUpdate(serverUpdates);

	LongPoll();
}
