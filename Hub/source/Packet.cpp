#include "Packet.hpp"

using namespace Node;

Node::Communicator::Packet::Packet() {

}

Node::Communicator::Packet::Packet(int nodeID, int msgType,
					const vector<char>& data) {
	this->nodeID = nodeID;
	this->msgType = msgType;
	this->data = data;
}

unsigned int Node::Communicator::Packet::GetNodeID() const {
	return nodeID;
}

unsigned char Node::Communicator::Packet::GetMsgType() const {
	return msgType;
}

const vector<char>&  Node::Communicator::Packet::GetData() const {
	return data;
}

void Node::Communicator::Packet::SetNodeID(unsigned int nodeID) {
	this->nodeID = nodeID;
}

void Node::Communicator::Packet::SetMsgType(unsigned char msgType) {
	this->msgType = msgType;
}

void Node::Communicator::Packet::SetData(const vector<char>& data) {
	this->data = data
}
