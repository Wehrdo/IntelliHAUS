#include "Server.hpp"


Hub::Server::Exception::Exception(const string& msg) : msg(msg) {

}

const char* Hub::Server::Exception::what() const noexcept {
	return msg.c_str();
}

Hub::Server::Server(string url) : http(url) {

}

Hub::Server::~Server() {

}

int Hub::Server::Connect() {
	return http.Connect();
}

void Hub::Server::Disconnect() {
	http.Disconnect();
}

int Hub::Server::Authenticate(const string& username, const string& password) {
	HTTP::Message authMsg("Connection: keep-alive\r\nContent-Type: application/json\r\n",
				string("{\"username\": \"") + username + "\",\r\n"
				"\"password\": \"" + password + "\"}");

	int retVal = http.Connect();

	if(retVal < 0)
		return -1;

	auto authResp = http.Post("/authenticate", authMsg);

	Json::Value jsonResp;
	stringstream jsonStream(authResp.GetBody());

	jsonStream >> jsonResp;

	bool success = jsonResp.get("success", false).asBool();

	if(!success) {
		throw Exception("Authenticate exception: " +
			jsonResp.get("error", "Unspecified error").asString());
	}

	accessToken = jsonResp.get("token", "").asString();

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

	auto userResp = http.Post("/signup", msg);

	cout << "Server response:\n" << userResp.ToString() << endl;

	Json::Value jsonResp;
	stringstream streamResp(userResp.GetBody());

	streamResp >> jsonResp;

	bool success = jsonResp.get("success", false).asBool();

	if(!success) {
		throw Exception("Create User exception: " +
			jsonResp.get("error", "Unspecified error").asString());
	}

	return 0;
}

int Hub::Server::CreateHome(const string& homeName) {
	if(accessToken.length() == 0) {
		throw new Exception("Create Home exception: "
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

	auto userResp = http.Post("/api/home", msg);

	cout << "Server response:\n" << userResp.ToString() << endl;

	Json::Value jsonResp;
	stringstream streamResp(userResp.GetBody());

	streamResp >> jsonResp;

	return 0;
}

int Hub::Server::GetHomeID(const string& homeName) {
	if(accessToken.length() == 0) {
		throw new Exception("GetHomeID exception: "
					"authentication needed");
	}

	string header = "Connection: keep-alive\r\n"
			"x-access-token: " + accessToken + "\r\n";

	auto msg = http.Get("/api/home", header);

	Json::Value jsonResp;
	stringstream streamResp(msg.GetBody());

	streamResp >> jsonResp;

	bool success = jsonResp.get("success", false).asBool();

	if(!success) {
		throw Exception("GetHomeID exception: " +
				jsonResp.get("error", "unspecified error").asString());
	}

	Json::Value jsonHomes = jsonResp["homes"];

	if(!jsonHomes.isArray()) {
		throw Exception("GetHomeID exception: "
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

	auto msgResp = http.Post("/api/datastream", msg);

	Json::Value jsonResp;
	stringstream streamResp(msgResp.GetBody());

	streamResp >> jsonResp;

	bool success = jsonResp.get("success", "false").asBool();

	if(!success) {
		throw Exception("CreateDatastream exception: " +
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

	cout << "HTTP Request:\r\n" << msg.ToString() << endl;

	auto msgResp = http.Post("/api/node", msg);

	Json::Value jsonResp;
	stringstream streamResp(msgResp.GetBody());

	streamResp >> jsonResp;

	bool success = jsonResp.get("success", "false").asBool();

	cout << msgResp.ToString() << endl;

	if(!success) {
		throw Exception("CreateNode exception: " +
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

	auto msgResp = http.Post("/api/datapoint", msg);

	Json::Value jsonResp;
	stringstream streamResp(msgResp.GetBody());

	streamResp >> jsonResp;

	bool success = jsonResp.get("success", "false").asBool();

	if(!success) {
		throw Exception("SendDatapoint exception: " +
			jsonResp.get("error", "No error specified").asString());
	}

	return 0;
}
