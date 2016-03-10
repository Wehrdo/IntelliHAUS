#include "Communicator.hpp"

Node::Communicator::Communicator(function<void(Node::Packet&)> cbPacket) {
	this->cbPacket = cbPacket;
	state = STATE_READY;
}

void Node::Communicator::ProcessBytes(vector<unsigned char> bytes) {
	for(auto &byte : bytes)
		ProcessSingleByte(byte);
}

void Node::Communicator::ProcessSingleByte(unsigned char byte) {
	switch(state) {
	case STATE_READY:
		if(byte == PACKET_START_BYTE) {
			index = 0;
			tempInt = 0;
			state = STATE_ID;
		}
	break;

	case STATE_ID:
		tempInt |= byte << (8 * (3 - index));
		index++;
		if(index == 4) {
			tempPacket.SetID(tempInt);

			index = 0;
			tempInt = 0;
			state = STATE_LENGTH;
		}
	break;

	case STATE_LENGTH:
		tempInt |= byte << (8 * (1 - index));
		index++;
		if(index == 2) {
			tempPacket.SetLength(tempInt);

			tempData.clear();
			state = STATE_PAYLOAD;
		}
	break;

	case STATE_PAYLOAD:
		tempData.push_back(byte);

		if(tempData.size() == tempPacket.GetLength()) {
			tempPacket.SetData(tempData);

			cbPacket(tempPacket);
			state = STATE_READY;
		}
	break;

	default:
		state = STATE_READY;
	}
}
