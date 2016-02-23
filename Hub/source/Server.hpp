#ifndef SERVER_HPP
#define SERVER_HPP

#include "HTTP.h"

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


	int CreateDatastream(string name, vector<string> ioTypes);
	int SendDatastream(string name, string data);

private:
	std::unique_ptr<HTTP> httpREST;
};

};

#endif
