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

#define ACTUATOR_ID	4

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
	HTTP http("intellihaus.ece.iastate.edu");

	http.Connect();

	auto cb = [](const HTTP::Message& msg){
                                cout << "Received response. " << endl;

                                return 0;
                        };

	while(1) {
		http.GetAsync("/", "Connection: keep-alive\r\n", cb);
		this_thread::sleep_for(chrono::milliseconds(100));
		http.GetAsync("/", "Connection: keep-alive\r\n", cb);

		cout << "Sent requests" << endl;

		this_thread::sleep_for(chrono::seconds(1));
	}

/*	boost::asio::io_service ioService;

	Server server(ioService, SERVER_URL);

	cout << "Server created" << endl;

	NodeServer nodeServer([&ioService, &server](Packet p){
		ioService.post([&server, p](){
			PacketCallback(p, server);
			});
		});

	cout << "NodeServer created" << endl;

	int retVal = server.Connect();
	if(retVal < 0) {
		cout << "Error connecting to server." << endl;
		return -1;
	}

	cout << "Server connected" << endl;

	try {
		server.Authenticate(USERNAME, PASSWORD);
	}
	catch(Exception e) {
		cout << "Exception caught: " << e.what() << endl;
		return -1;
	}

	cout << "Server authenticated" << endl;

	this_thread::sleep_for(chrono::seconds(2));

	nodeServer.Start();

	cout << "NodeServer started" << endl;

	thread hubThread([&ioService]() {
		while(1) {
			ioService.run();
			ioService.reset();

			this_thread::sleep_for(chrono::milliseconds(10));
		}
	});

	cout << "Hub thread started" << endl;

	while(1) {
		uint32_t color;
		cout << "Color: ";
		cin >> hex >> color;

		if(nodeServer.IsNodeConnected(ACTUATOR_ID)) {
			Packet p = Packet::FromInt(ACTUATOR_ID, color);

			//cout << "Sending packet" << endl;

			try {
				nodeServer.SendPacket(p);
			} catch(Exception &e) {
				cout << "SendPacket exception: " << e.what() << endl;
			}
		}
		else
			cout << "Error: Node " << ACTUATOR_ID << " not connected" << endl;
	}

	server.Disconnect();
*/
	return 0;
}
