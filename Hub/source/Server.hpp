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

	Server(int homeID, const string& url, const string& username,
		const string& password, function<void(const vector<ServerUpdate>&)> cbUpdate);
	~Server();

	bool IsConnected();

	int SendDatapoint(int nodeID, float data);
	int SendDiscrete(int nodeID, int data);
private:
//	void Connect();
//	void Disconnect();

	void Authenticate();
	void cbAuthenticate(const Exception& e, const HTTP::Message& msg);

	void LongPoll();
	void cbLongPoll(const Hub::HTTP::Message& msg);

	void ThreadRoutine();

	void cbConnect();

	function<void(const vector<ServerUpdate>&)> cbUpdate;

	boost::asio::io_service ioService;

	thread asyncThread;

	Hub::HTTP http;
	int homeID;
	string accessToken, userName, password;
	bool isConnected;
};

};

#endif
