#ifndef SERVER_HPP
#define SERVER_HPP

#include <sstream>
#include <vector>
#include <functional>
#include <boost/asio.hpp>
#include "Exception.hpp"
#include "HTTP.hpp"
#include "json/json/json.h"

using namespace std;
using namespace Hub;

namespace Hub {

class Server
{
public:
	enum Datatype {
		CONTINUOUS,
		DISCRETE,
		BINARY
	};

	struct ServerUpdate {
		uint32_t nodeID;
		vector<float> values;
	};

	Server(int homeID, const string& url, const string& username, const string& password, function<void(const vector<ServerUpdate>&)> cbUpdate);
	~Server();

	bool IsConnected();

	int SendDatapoint(int nodeID, float data);
private:
	void Connect();
	void Disconnect();

	void Authenticate(const string& username, const string& password);

	void LongPoll();
	void cbLongPoll(const Hub::HTTP::Message& msg);

	function<void(const vector<ServerUpdate>&)> cbUpdate;

	Hub::HTTP http;
	int homeID;
	string accessToken;
	bool isConnected;
};

};

#endif
