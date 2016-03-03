#include "Node.hpp"

using namespace std;
using namespace Node;

int main() {
	vector<char> data;

	data.push_back(0);
	data.push_back(1);
	data.push_back(2);
	data.push_back(3);

	Communicator::Packet p(1, 1, data);

	Communicator comm("intellihub.ece.iastate.edu");

	comm.Connect();

	comm.SendPacket(p);

	comm.Disconnect();

	return 0;
}
