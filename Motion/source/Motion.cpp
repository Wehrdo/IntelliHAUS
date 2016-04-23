#include "Motion.hpp"
#include <bcm2835.h>

#define DELAY		1000

#define NODEID	4

using namespace std;
using namespace Node;

int main() {
	cout << "Starting sensor..." << endl;

	Sensor sensor;

	cout << "Connecting to hub..." << endl;

	Communicator comm(NODEID, "intellihub.ece.iastate.edu",
			[](const Packet& p){
				});

	//comm.Connect();

	cout << "Connected to hub" << endl;

	while(1) {
		if(sensor.Check()) {
			cout << "Motion detected" << endl;

			comm.SendPacket(Packet(NODEID, Packet::TYPE_DISCRETE, vector<unsigned char>({0, 0, 0, 1})));
		}
	}

	//comm.Disconnect();

	return 0;
}
