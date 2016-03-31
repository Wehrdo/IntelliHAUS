#include "Node.hpp"

#define DELAY		1000

using namespace std;
using namespace Node;

void cbPacket(const Packet& p);

int main() {
	unsigned int nodeID = 0;

	cout << "Node ID: ";
	cin >> nodeID;

	Communicator comm(nodeID, "intellihub.ece.iastate.edu", cbPacket);

	this_thread::sleep_for(chrono::seconds(2));

	comm.Connect();

	for(int32_t i = 0; ; ++i) {
		comm.SendFloat(i);

		this_thread::sleep_for(chrono::milliseconds(DELAY));
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
