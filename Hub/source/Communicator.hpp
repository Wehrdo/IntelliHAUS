#ifndef COMMUNICATOR_HPP
#define COMMUNICATOR_HPP

#include <vector>
#include <functional>
#include <cstdint>
#include "Packet.hpp"

/*
	*Communicator.hpp
	*This file implements the Hub::Communicator class
	*This class implements the Node->Hub FSM for receiving packets
	*
*/

using namespace std;

namespace Hub
{
class Communicator
{
public:
	//Constructor
	//Param cbPacket: callback for receive full packet event
	Communicator(function<void(Hub::Packet&)> cbPacket);

	//CreateBinaryMessage
	//Param p: Packet to be converted
	//return : vector<unsigned char>, binary array representing the Packet p
	static vector<unsigned char> CreateBinaryMessage(const Packet& p);

	//ProcessBytes
	//Param bytes : array of bytes to process through the FSM
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
