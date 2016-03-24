#ifndef COMMUNICATOR_HPP
#define COMMUNICATOR_HPP

#include <vector>
#include <functional>
#include <cstdint>
#include "Packet.hpp"

using namespace std;

namespace Hub
{
class Communicator
{
public:
	Communicator(function<void(Hub::Packet&)> cbPacket);

	static vector<unsigned char> CreateBinaryMessage(const Packet& p);

	void ProcessBytes(vector<unsigned char> bytes);
private:
	static const unsigned char PACKET_START_BYTE = 0xAA;

	void ProcessSingleByte(unsigned char byte);
	enum {
		STATE_READY,
		STATE_ID,
		STATE_TYPE,
		STATE_LENGTH,
		STATE_PAYLOAD,
	} state;

	function<void(Hub::Packet&)> cbPacket;

	//int index;
	//uint32_t tempInt;
	vector<unsigned char> tempData;

	Packet tempPacket;
};
}


#endif
