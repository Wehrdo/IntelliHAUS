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

	enum Datatype {
		CONTINUOUS,
		DISCRETE,
		BINARY
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
	int CreateHome(const string& homeName);

	//Needs authentication
	int CreateDatastream(const string& name, Datatype datatype);

	//Needs authentication
	int CreateNode(int homeID, const string& name, Datatype datatype,
			const string& outputName, int datastreamID);

	//Needs authentication
	int GetHomeID(const string& homeName);

	//Needs authentication
	int SendDatapoint(int nodeID, float data);



private:
	Hub::HTTP http;
	string accessToken;
};

};

#endif
