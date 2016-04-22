#include "Communicator.hpp"

Hub::Communicator::Communicator(function<void(Hub::Packet&)> cbPacket) {
	this->cbPacket = cbPacket;
	state = STATE_READY;
}

void Hub::Communicator::ProcessBytes(vector<unsigned char> bytes) {

	//Loop through each byte
	for(auto &byte : bytes)
		ProcessSingleByte(byte);
}

vector<unsigned char> Hub::Communicator::CreateBinaryMessage(const Packet& p) {
	vector<unsigned char> binaryMessage;

	//Start byte
	binaryMessage.push_back(0xAA);

	//4 byte Node ID
	binaryMessage.push_back( (p.nodeID >> 24) & 0xFF);
	binaryMessage.push_back( (p.nodeID >> 16) & 0xFF);
	binaryMessage.push_back( (p.nodeID >> 8) & 0xFF);
	binaryMessage.push_back( (p.nodeID) & 0xFF);

	//Message type
	binaryMessage.push_back(p.msgType);

	//Payload length
	int length = p.data.size();
	binaryMessage.push_back( (length >> 8) & 0xFF);
	binaryMessage.push_back( (length) & 0xFF);

	//Payload
	for(auto &b : p.data)
		binaryMessage.push_back(b);

	return binaryMessage;
}

void Hub::Communicator::ProcessSingleByte(unsigned char byte) {
	//static variables for each packet component
	static int index = 0;
	static uint64_t tempID = 0;
	static uint64_t tempLength = 0;
	static Packet tempPacket;

	//Enter the FSM
	switch(state) {
	
	//Waiting for header
	case STATE_READY:
		if(byte == PACKET_START_BYTE) {

			//Clear the packet components
			index = 0;
			tempID = 0;
			tempLength = 0;
			tempPacket = Packet();
			state = STATE_ID;
		}
	break;

	case STATE_ID:
		//Pack in the 4-byte ID
		tempID |= byte << (8 * (3 - index));
		index++;
		if(index == 4) {
			tempPacket.nodeID = tempID;

			index = 0;
			state = STATE_TYPE;
		}
	break;

	case STATE_TYPE:
		tempPacket.msgType = byte;
		state = STATE_LENGTH;
	break;

	case STATE_LENGTH:
		//Pack in the 2-byte length
		tempLength |= byte << (8 * (1 - index));
		index++;
		if(index == 2) {
			//If length==0
			//We skip the payload state
			if(tempLength == 0) {
				cbPacket(tempPacket);
				state = STATE_READY;
			}
			else {
				tempData.clear();
				state = STATE_PAYLOAD;
			}
		}
	break;

	case STATE_PAYLOAD:
		//store the data
		tempData.push_back(byte);

		if(tempData.size() == tempLength) {
			tempPacket.data = tempData;

			//Notify the callback
			cbPacket(tempPacket);

			//Wait for the next packet
			state = STATE_READY;
		}
	break;

	default:
		state = STATE_READY;
	}
}
