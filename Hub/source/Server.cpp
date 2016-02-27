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

//	cout << bodyStream.str();

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
		throw Exception("Create User exception: " + jsonResp.get("error", "Unspecified error").asString());
	}



	return 0;
}
