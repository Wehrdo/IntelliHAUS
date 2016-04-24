#ifndef SERVER_HPP
#define SERVER_HPP

#include <sstream>
#include <vector>
#include <map>
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
	//enum Datatype
	//The three possible datatypes to send to the server
	enum Datatype {
		CONTINUOUS,
		DISCRETE,
		BINARY
	};

	//struct ServerUpdate
	//Contains a nodeID and associated update values
	struct ServerUpdate {
		uint32_t nodeID;
		vector<float> values;
	};

	//constructor Server(int homeID, const string&url, const string& username
	//Initializes the server object and immediately attempts to connect to the cloud server
	Server(int homeID, const string& url, const string& username,
		const string& password, function<void(const vector<ServerUpdate>&)> cbUpdate);

	//Deconstructor
	~Server();

	//bool IsConnected
	//Returns bool : true if connected to cloud server, false otherwise
	bool IsConnected();

	//int SendDatapoint(int nodeID, float data)
	//Sends a datapoint from a particular node to the cloud server
	//Param int nodeID : node associated with datum
	//Param float data : dataum
	int SendDatapoint(int nodeID, float data);

	//int SendDiscrete(int nodeID, int data)
	//Sends a discrete datapoint from a particular node to the cloud server
	//Param int nodeID : node associated with datum
	//Param int data : datum
	int SendDiscrete(int nodeID, int data);

	//vector<float> GetNodeState(int nodeID)
	//Returns the cached node state
	//Param int nodeID : node to query for
	//returns vector<float> : cached state
	vector<float> GetNodeState(int nodeID);
private:
//	void Connect();
//	void Disconnect();

	//Async authenticate the user with the cloud server
	void Authenticate();
	//Callback for async authenticate event
	void cbAuthenticate(const Exception& e, const HTTP::Message& msg);

	//Start a long polling request with cloud server
	void LongPoll();
	//Callback for async long poll 
	void cbLongPoll(const Hub::HTTP::Message& msg);

	//Query the states for all nodes associated with this hub
	void QueryStates();
	//Callback for QueryState event
	void cbQueryStates(const Hub::HTTP::Message& msg);

	//Parse the Json update array
	void UpdateStates(const Json::Value& updateArray);

	void ThreadRoutine();

	//Callback for connect event
	void cbConnect();

	//External callback for server update event
	function<void(const vector<ServerUpdate>&)> cbUpdate;

	boost::asio::io_service ioService;

	thread asyncThread;

	Hub::HTTP http;
	int homeID;
	string accessToken, userName, password;
	bool isConnected;

	//Map associating nodeIDs with previous states
	map<int, vector<float>> nodeStates;
};

};

#endif
