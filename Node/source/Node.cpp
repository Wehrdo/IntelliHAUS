#include "Node.hpp"

#define NODEID		1
#define DELAY		1000

#define LED_COUNT	49

using namespace std;
using namespace Node;

void cbPacket(const Packet& p, LightStrip& strip);

void SetColor(LightStrip& strip, uint32_t color);

int main() {
	boost::asio::io_service ioService;

	LightStrip strip(LED_COUNT);

	strip.Display();

	Communicator comm(NODEID, "intellihub.ece.iastate.edu",
			[&strip](const Packet& p){cbPacket(p, strip);});

	this_thread::sleep_for(chrono::seconds(2));

	comm.Connect();

	while(1) {
		ioService.run();
		ioService.reset();

		this_thread::sleep_for(chrono::milliseconds(10));
	}

	comm.Disconnect();

	return 0;
}

void cbPacket(const Packet& p, LightStrip& strip) {

	switch(p.GetMsgType()) {
	case Packet::TYPE_INT: {
		Color c(p.GetDataAsInt());

		cout << "Received color: " << c.ToString() << endl;

		strip.SetAll(Color(p.GetDataAsInt()));
		strip.Display();
	}
	break;

	default:
		cout << "Received malformed packet" << endl;
	}
}
