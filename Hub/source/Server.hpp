#ifndef SERVER_HPP
#define SERVER_HPP

#include "HTTP.hpp"

using namespace std;

namespace Hub {

class Server
{
public:
	Server(string url);
	~Server();

	int Connect();
	void Disconnect();

	bool IsConnected();

	//Interface for server REST API
	int Authenticate(const string& username, const string& password);

	int CreateUser(const string& username, const string& password,
			const string& firstName, const string& lastName);

	string& ListNodes(int homeID);
	int CreateNode(int home, const string& inTypes, const string& inNames,
			const string& outTypes, const string& outNames);

	int CreateHome(const string& homeName);

	int CreateDatastream(string name, vector<string> ioTypes);
	int SendDatapoint(string name, string data);



private:
	std::unique_ptr<HTTP> httpREST;
};

};

#endif
