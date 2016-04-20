#include "Node.hpp"
#include <bcm2835.h>

#define DELAY		1000

#define NODEID	4

using namespace std;
using namespace Node;

void cbPacket(const Packet& p);

int main() {
	unsigned int nodeID = 0;

	cout << "Starting outlet..." << endl;

	Outlet outlet;
/*
	if(!bcm2835_init())
		cout << "Unable to initialize bcm2835!" << endl;
	
	bcm2835_gpio_fsel(RPI_GPIO_P1_07, BCM2835_GPIO_FSEL_OUTP);

	bool state = false;
	while(1) {
		cout << "Toggling pin state..." << endl;

		bcm2835_gpio_write(RPI_GPIO_P1_07, state ? HIGH : LOW);

		this_thread::sleep_for(chrono::milliseconds(100));

		state = !state;
	}

*/
	int i = 0;
	while(1) {
		cout << "Turning on outlet " << (i + 1) << endl;
		outlet.Set(i, true);

		this_thread::sleep_for(chrono::seconds(1));

		cout << "Turning off outlet " << (i + 1) << endl;
		outlet.Set(i, false);

		this_thread::sleep_for(chrono::seconds(1));

		i = (i + 1) % 3;
	}

	cout << "Node ID: ";
	cin >> nodeID;

	Communicator comm(nodeID, "intellihub.ece.iastate.edu", cbPacket);

	this_thread::sleep_for(chrono::seconds(2));

	comm.Connect();

	for(;;) {
		float f = 0.f;

		cout << "Datapoint: ";
		cin >> f;
		cout << endl;

		comm.SendFloat(f);

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
