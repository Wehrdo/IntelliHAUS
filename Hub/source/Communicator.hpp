#ifndef COMMUNICATOR_HPP
#define COMMUNICATOR_HPP

#include <vector>
#include <functional>
#include <cstdint>
#include "Packet.hpp"

using namespace std;

namespace Node
{
class Communicator
{
public:
	Communicator(function<void(Node::Packet&)> cbPacket);

	void ProcessBytes(vector<unsigned char> bytes);
private:
	static const unsigned char PACKET_START_BYTE = 0xAA;

	void ProcessSingleByte(unsigned char byte);
	enum {
		STATE_READY,
		STATE_ID,
		STATE_LENGTH,
		STATE_PAYLOAD,
	} state;

	function<void(Node::Packet&)> cbPacket;

	int index;
	uint32_t tempInt;
	vector<unsigned char> tempData;

	Packet tempPacket;
};
}


#endif
