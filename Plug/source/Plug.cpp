#include "Node.hpp"
#include <bcm2835.h>

#define DELAY		1000

#define NODEID	4

using namespace std;
using namespace Node;

void cbPacket(const Packet& p);

int main() {
	boost::asio::io_service ioService;

	cout << "Starting outlet..." << endl;

	Outlet outlet;

	Communicator comm(NODEID, "intellihub.ece.iastate.edu", cbPacket);

	this_thread::sleep_for(chrono::seconds(2));

	cout << "Connecting to hub..." << endl;

	comm.Connect();

	cout << "Hub connected" << endl;

	while(1) {
		ioService.run();
		ioService.reset();

		this_thread::sleep_for(chrono::milliseconds(10));
	}

	comm.Disconnect();

	return 0;
}

void cbPacket(const Packet& p) {

	switch(p.GetMsgType()) {
	case Packet::TYPE_INT:
		cout << "Received int: " << p.GetDataAsInt() << endl;
	break;

	case Packet::TYPE_FLOAT:
		cout << "Received float: " << p.GetDataAsFloat() << endl;
	break;

	default:
		cout << "Received non int/float packet" << endl;
	}
}
