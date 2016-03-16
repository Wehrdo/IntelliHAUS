#include "Packet.hpp"


Hub::Communicator::Packet::Packet() {

}

Hub::Communicator::Packet::Packet(int nodeID, int msgType,
					const vector<char>& data) {
	this->nodeID = nodeID;
	this->msgType = msgType;
	this->data = data;
}

unsigned int Hub::Communicator::Packet::GetNodeID() const {
	return nodeID;
}

unsigned char Hub::Communicator::Packet::GetMsgType() const {
	return msgType;
}

const vector<char>&  Hub::Communicator::Packet::GetData() const {
	return data;
}

void Hub::Communicator::Packet::SetNodeID(unsigned int nodeID) {
	this->nodeID = nodeID;
}

void Hub::Communicator::Packet::SetMsgType(unsigned char msgType) {
	this->msgType = msgType;
}

void Hub::Communicator::Packet::SetData(const vector<char>& data) {
	this->data = data
}
