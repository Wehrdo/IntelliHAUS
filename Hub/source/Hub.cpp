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

void PacketCallback(Hub::Packet p, Server &server, NodeServer& nodeServer) {
	string message;
	uint32_t nodeID = p.GetNodeID();

	switch(p.GetMsgType()) {
		case Packet::TYPE_ID: {
				message = "Identification received from Node " +
					to_string(nodeID);

				auto values = server.GetNodeState(nodeID);
				
				if(values.size() > 0)
					nodeServer.SendActuation(nodeID, values);
		}
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

		case Packet::TYPE_DISCRETE: {
			int val = p.GetDataAsInt();
			cout << "Received discrete value '" << val << "' from node " <<
				nodeID << endl;
			server.SendDiscrete(nodeID, val);
		}
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

	Server server(HOMEID, SERVER_URL, USERNAME, PASSWORD,
		[&ioService, &nodeServer](const vector<Server::ServerUpdate>& updates) {
					cout << "Immediately received " << updates.size() << endl;
					ioService.post([&nodeServer, updates]() {
						UpdateCallback(*nodeServer, updates);
					});
				});

	cout << "Server created" << endl;

	nodeServer.reset(new NodeServer([&ioService, &server, &nodeServer](Packet p){
		ioService.post([&server, &nodeServer, p](){
			PacketCallback(p, server, *nodeServer);
			});
		}));

	cout << "NodeServer created" << endl;

	try {
		nodeServer->Start();
	}
	catch(...) {
		cout << "Unspecified error occurred." << endl;
		return -1;
	}

	cout << "NodeServer started" << endl;

	while(1) {
		ioService.run();
		ioService.reset();

		this_thread::sleep_for(chrono::milliseconds(10));
	}

	return 0;
}

void UpdateCallback(NodeServer& nodeServer, const vector<Server::ServerUpdate>& updates) {
	cout << "Received " << updates.size() << " updates" << endl;

	for(auto &update : updates) {
		try {
			cout << "Sending actuation to node " << update.nodeID << endl;
			nodeServer.SendActuation(update.nodeID, update.values);
		}
		catch(exception &e) {
			cout << "UpdateCallback exception: " << e.what() << endl;

			//TODO: handle the error cleanly
			//queue the actuation for retry
		}
	}
}
