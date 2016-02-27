#ifndef SERVER_HPP
#define SERVER_HPP

#include <sstream>
#include <exception>
#include "HTTP.hpp"
#include "json/json/json.h"

using namespace std;

namespace Hub {

class Server
{
public:
	class Exception : public exception {
	public:
		Exception(const string& msg);

		virtual const char* what() const noexcept;
	private:
		string msg;
	};

	Server(string url);
	~Server();

	int Connect();
	void Disconnect();

	bool IsConnected();

	//Interface for server REST API

	int Authenticate(const string& username, const string& password);

	int CreateUser(const string& username, const string& password,
			const string& firstName, const string& lastName,
			const string& email);

	//Needs authentication
	string& ListNodes(int homeID);

	//Needs authentication
	int CreateNode(int home, const string& inTypes, const string& inNames,
			const string& outTypes, const string& outNames);

	//Needs authentication
	int CreateHome(const string& homeName);

	//Needs authentication
	int CreateDatastream(string name, vector<string> ioTypes);

	//Needs authentication
	int SendDatapoint(string name, string data);



private:
	Hub::HTTP http;
	string accessToken;
};

};

#endif
