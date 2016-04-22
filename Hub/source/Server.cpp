#include "Server.hpp"


Hub::Server::Server(int homeID, const string& url, const string& username,
			const string& password,
			function<void(const vector<ServerUpdate>&)> cbUpdate)
			: http(url, [this](){cbConnect();}),
			userName(username), password(password),
			asyncThread([this](){ThreadRoutine();}) {
	this->homeID = homeID;
	this->cbUpdate = cbUpdate;
}

Hub::Server::~Server() {

}

void Hub::Server::ThreadRoutine() {
	while(1) {
		ioService.run();
		ioService.reset();

		this_thread::sleep_for(chrono::milliseconds(10));
	}
}

void Hub::Server::cbConnect() {
	cout << "cbConnect" << endl;
	ioService.post([this](){ Authenticate(); });
}

void Hub::Server::Authenticate() {
	HTTP::Message authMsg("Connection: keep-alive\r\nContent-Type: application/json\r\n",
				string("{\"username\": \"") + userName + "\",\r\n"
				"\"password\": \"" + password + "\"}");

	if(!http.IsConnected()) {
//		cbAuthenticate(Exception(Error_Code::SERVER_NOT_CONNECTED,
//				"Server::Authenticate error: not connected"), HTTP::Message());
		cout << "Not connected." << endl;
		return;
	}

	http.Post("/authenticate", authMsg,
			[this](const HTTP::Message& msg) {
				cbAuthenticate(Exception(), msg);
			});
}

void Hub::Server::cbAuthenticate(const Exception& e, const HTTP::Message& msg) {
	cout << "cbAuthenticate" << endl;

	cout << "HTTP Message:\r\n" << msg.GetBody() << endl;

	if(e.GetErrorCode() == Error_Code::SERVER_NOT_CONNECTED) {
		cout << "Authenticate error: Server not connected.";
	}

	Json::Value jsonResp;
	stringstream jsonStream(msg.GetBody());

	try {
		jsonStream >> jsonResp;
	}
	catch(exception& e) {
		cout << "Authenticate exception: " << e.what() << endl;
		cout << "JSON String: " << msg.GetBody() << endl;
		return;
	}
	catch(...) {
		cout << "ERROR. Json string: " << msg.GetBody() << endl;
		return;
	}

	bool success;

	try {
		success = jsonResp.get("success", false).asBool();
	}
	catch(exception &e) {
		cout << "Authenticate exception caught: " << e.what() << endl;
		return;
	}

	if(!success) {
		//throw Exception(Error_Code::SERVER_ERROR_NOT_SPECIFIED,
		//		"Authenticate exception: " +
		//	jsonResp.get("error", "Unspecified error").asString());
		cout << "Authentication error: " <<
			jsonResp.get("error", "Unspecified error").asString() << endl;

		return;
	}

	accessToken = jsonResp.get("token", "").asString();

	QueryStates();

	LongPoll();

	cout << "cbAuthenticate finished." << endl;

	return;
}

int Hub::Server::SendDatapoint(int nodeID, float data) {
	Json::Value jsonRequest;
	stringstream streamRequest;

	cout << "SendDatapoint" << endl;

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


int Hub::Server::SendDiscrete(int nodeID, int data) {
	Json::Value jsonRequest;
	stringstream streamRequest;

	cout << "SendDatapoint" << endl;

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

vector<float> Hub::Server::GetNodeState(int nodeID) {
	try {
		return nodeStates[nodeID];
	}
	catch(exception &e) {
		return vector<float>();
	}
}

void Hub::Server::LongPoll() {
	string header = "Connection: keep-alive\r\n"
			"Content-Type: application/json\r\n"
			"x-access-token: " + accessToken + "\r\n"
			"homeid: " + std::to_string(homeID) + "\r\n";

	http.Get("/api/updates", header, [this](const Hub::HTTP::Message& msg){cbLongPoll(msg);});
}

void Hub::Server::QueryStates() {
	string header = "Connection: keep-alive\r\n"
			"Content-Type: application/json\r\n"
			"x-access-token: " + accessToken + "\r\n"
			"homeid: " + std::to_string(homeID) + "\r\n";

	http.Get("/api/updates/all", header, [this](const Hub::HTTP::Message& msg){cbQueryStates(msg);});
}


void Hub::Server::cbLongPoll(const Hub::HTTP::Message& msg) {
	cout << "cbLongPoll" << endl;

	Json::Value jsonResp;

	stringstream streamResp(msg.GetBody());
	stringstream testStream;

	//TODO: put try/catch block here
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

	UpdateStates(updates);

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

void Hub::Server::cbQueryStates(const Hub::HTTP::Message& msg) {
	cout << "cbLongPoll" << endl;

	Json::Value jsonResp;

	stringstream streamResp(msg.GetBody());
	stringstream testStream;

	//TODO: put try/catch block here
		streamResp >> jsonResp;

	bool success;

	try {
		success = jsonResp.get("success", "false").asBool();
	}
	catch(exception &e) {
		cout << "QueryStates exception: " << e.what() << endl;
		return;
	}

	if(!success) {
		cout << "QueryStates error." << endl;
		return;
	}

	Json::Value updates = jsonResp["updates"];

	int updateCount = 0;
	vector<ServerUpdate> serverUpdates;

	UpdateStates(updates);

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

	cout << "Query States response: " << updateCount << " updates." << endl;

	if(updateCount > 0)
		cbUpdate(serverUpdates);
}

void Hub::Server::UpdateStates(const Json::Value& updateArray) {
	for(auto &update : updateArray) {
		int nodeID = update.get("nodeId", "0").asInt();
		vector<float> data;

		Json::Value values = update["data"];

		for(auto &value : values) {
			float f;
			data.push_back(f = value.asFloat());
		}

		nodeStates[nodeID] = data;
	}
}
