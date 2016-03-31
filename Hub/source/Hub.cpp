#include "Hub.hpp"

using namespace std;
using namespace Hub;

#define USERNAME	"eric"
#define PASSWORD	"test1234"

#define HOMENAME	"Home1"
#define STREAMNAME	"Datastream1"

#define NODENAME	"Node1"
#define OUTPUTNAME	"Node1Output"

#define HOMEID		1
#define STREAMID	2

#define NODEID		2

#define ACTUATOR_ID	1

using boost::asio::ip::tcp;

using namespace Hub;

#include <cerrno>

void UpdateCallback(NodeServer& nodeServer, const vector<Server::ServerUpdate>& updates);

void PacketCallback(Hub::Packet p, Server &server) {
	string message;
	uint32_t nodeID = p.GetNodeID();

//	cout << "Entering packet callback..." << endl;

	switch(p.GetMsgType()) {
		case Packet::TYPE_ID:
			message = "Identification received from Node " +
				to_string(nodeID);
		break;

		case Packet::TYPE_INT:
			message = "Forwarding int from node " +
				to_string(nodeID) + ": " +
				to_string(p.GetDataAsInt());
			server.SendDatapoint(nodeID, p.GetDataAsInt());
		break;

		case Packet::TYPE_FLOAT:
			message = "Forwarding float from node " +
				to_string(nodeID) + ": " +
				to_string(p.GetDataAsFloat());
			server.SendDatapoint(nodeID, p.GetDataAsFloat());
		break;

		default:
			message = "Received unimplemented message type from"
				"node " + to_string(nodeID) + ": " +
				to_string(p.GetMsgType());
		break;
	}

	cout << message << endl;
}

int main() {
	boost::asio::io_service ioService;
	shared_ptr<NodeServer> nodeServer;

	Server server(HOMEID, SERVER_URL, [&ioService, &nodeServer](const vector<Server::ServerUpdate>& updates) {
					ioService.post([&nodeServer, updates]() {
						UpdateCallback(*nodeServer, updates);
					});
				});

	cout << "Server created" << endl;

	nodeServer.reset(new NodeServer([&ioService, &server](Packet p){
//		cout << "NodeServer Callback" << endl;
		ioService.post([&server, p](){
			PacketCallback(p, server);
			});
		}));

	cout << "NodeServer created" << endl;

	int retVal = server.Connect();
	if(retVal < 0) {
		cout << "Error connecting to server." << endl;
		return -1;
	}

	cout << "Server connected" << endl;

	this_thread::sleep_for(chrono::seconds(2));

	try {
		server.Authenticate(USERNAME, PASSWORD);
	}
	catch(exception e) {
		cout << "Exception caught: " << e.what() << endl;
		return -1;
	}

	cout << "Server authenticated" << endl;

	this_thread::sleep_for(chrono::seconds(2));

	nodeServer->Start();

	cout << "NodeServer started" << endl;

/*	thread hubThread([&ioService]() {
		while(1) {
			ioService.run();
			ioService.reset();

			this_thread::sleep_for(chrono::milliseconds(10));
		}
	});
*/
	cout << "Hub thread started" << endl;

	while(1) {
/*
		uint32_t color;
		cout << "Color: ";
		cin >> hex >> color;

		if(nodeServer.IsNodeConnected(ACTUATOR_ID)) {
			Packet p = Packet::FromInt(ACTUATOR_ID, color);

			try {
				nodeServer.SendPacket(p);
			} catch(Exception &e) {
				cout << "SendPacket exception: " << e.what() << endl;
			}
		}
		else
			cout << "Error: Node " << ACTUATOR_ID << " not connected" << endl;
*/
		ioService.run();
		ioService.reset();

		this_thread::sleep_for(chrono::milliseconds(10));
	}

	server.Disconnect();

	return 0;
}

void UpdateCallback(NodeServer& nodeServer, const vector<Server::ServerUpdate>& updates) {
	for(auto &update : updates) {
		try {
			nodeServer.SendActuation(update.nodeID, update.values);
		}
		catch(exception &e) {
			cout << "UpdateCallback exception: " << e.what() << endl;

			//TODO: handle the error cleanly
			//queue the actuation for retry
		}
	}
}
