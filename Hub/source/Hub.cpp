#include "Hub.hpp"

using namespace std;
using namespace Hub;

#define USERNAME	"Eric"
#define PASSWORD	"test1234"

#define HOMENAME	"Home1"
#define STREAMNAME	"Datastream1"

#define NODENAME	"Node1"
#define OUTPUTNAME	"Node1Output"

#define HOMEID		2
#define STREAMID	4

#define NODEID		3

using boost::asio::ip::tcp;

using namespace Hub;

#include <cerrno>

void PacketCallback(Hub::Packet p, Server &server) {
	string message;
	uint32_t nodeID = p.GetNodeID();

	switch(p.GetMsgType()) {
		case Packet::TYPE_ID:
			message = "Identification received from Node " +
				to_string(nodeID);
		break;

		case Packet::TYPE_INT:
			message = "Received int from node " +
				to_string(nodeID) + ": " +
				to_string(p.GetDataAsInt());
			server.SendDatapoint(nodeID, p.GetDataAsInt());
		break;

		case Packet::TYPE_FLOAT:
			message = "Received float from node " +
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

	//Create thread for ioService tasks
	/*thread([&ioService]() {
		while(1) {
			ioService.run();
			ioService.reset();

			this_thread::sleep_for(chrono::milliseconds(10));
		}
	});*/

	Server server(ioService, SERVER_URL);

	NodeServer nodeServer([&ioService, &server](Packet p){
		ioService.post([&server, p](){
			PacketCallback(p, server);
			});
		});

/*	NodeServer nodeServer([&server](Packet p) {
		PacketCallback(p, server);
		});*/

	int retVal = server.Connect();
	if(retVal < 0) {
		cout << "Error connecting to server." << endl;
		return -1;
	}

	try {
		server.Authenticate(USERNAME, PASSWORD);
	}
	catch(Exception e) {
		cout << "Exception caught: " << e.what() << endl;
		return -1;
	}

	this_thread::sleep_for(chrono::seconds(2));

	nodeServer.Start();

	thread hubThread([&ioService]() {
		while(1) {
			ioService.run();
			ioService.reset();

			this_thread::sleep_for(chrono::milliseconds(10));
		}
	});

	while(1) {
		Packet p = Packet::FromInt(4, 0x00FF0000);

		cout << "Sending packet" << endl;

		try {
			nodeServer.SendPacket(p);
		} catch(Exception &e) {
			cout << "SendPacket exception: " << e.what() << endl;
		}

		this_thread::sleep_for(chrono::seconds(1));
	}

	server.Disconnect();

	return 0;
}
