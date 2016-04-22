#include "Plug.hpp"
#include <bcm2835.h>

#define DELAY		1000

#define NODEID	4

using namespace std;
using namespace Node;

void cbPacket(const Packet& p, Outlet &outlet);

int main() {
	boost::asio::io_service ioService;

	cout << "Starting outlet..." << endl;

	Outlet outlet;

	cout << "Connecting to hub..." << endl;

	Communicator comm(NODEID, "intellihub.ece.iastate.edu",
			[&outlet, &ioService](const Packet& p){
				ioService.post([p, &outlet]() {
					cbPacket(p, outlet);
				});
			});

	comm.Connect();

	cout << "Connected to hub" << endl;

	this_thread::sleep_for(chrono::seconds(2));

	while(1) {
		ioService.run();
		ioService.reset();

		this_thread::sleep_for(chrono::milliseconds(10));
	}

	comm.Disconnect();

	return 0;
}

void cbPacket(const Packet& p, Outlet& outlet) {
	if(p.GetMsgType() != Packet::TYPE_FLOATARRAY) {
		cout << "Error: Packet received not of type 'Float Array'" << endl;
		return;
	}

	auto values = p.GetDataAsFloatArray();

	if(values.size() != 3) {
		cout << "Receive Error: expected array size 3, got " <<
				values.size() << endl;
		return;
	}

	for(int i = 0; i < 3; i++) {
		//round the float
		int actuate = values[i] + 0.5f;

		cout << "Setting outlet " << (i+1) << " to " << actuate << endl;

		outlet.Set(i, actuate);
	}
}
