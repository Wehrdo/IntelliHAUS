#include "Packet.hpp"

using namespace Hub;

Hub::Packet::Packet() {

}

Hub::Packet::Packet(int nodeID, int msgType,
					const vector<unsigned char>& data) {
	this->nodeID = nodeID;
	this->msgType = msgType;
	this->data = data;
}

Hub::Packet Hub::Packet::FromInt(uint32_t nodeID, int32_t value) {
	vector<unsigned char> data;

	//Split the 32-bit int into 4 bytes
	data.push_back( (value >> 24) & 0xFF );
	data.push_back( (value >> 16) & 0xFF );
	data.push_back( (value >> 8) & 0xFF );
	data.push_back( (value) & 0xFF );

	//Construct the packet and return
	Packet p(nodeID, Packet::TYPE_INT, data);

	return p;
}

unsigned int Hub::Packet::GetNodeID() const {
	return nodeID;
}

unsigned char Hub::Packet::GetMsgType() const {
	return msgType;
}

const vector<unsigned char>&  Hub::Packet::GetData() const {
	return data;
}

int32_t Hub::Packet::GetDataAsInt() const {
	if(msgType != TYPE_INT)
		throw Exception("Packet::GetDataAsInt: "
				"Packet is not of type 'TYPE_INT'");

	uint32_t retVal = data[0] << 24;
	retVal |= data[1] << 16;
	retVal |= data[2] << 8;
	retVal |= data[3];

	return retVal;
}

float Hub::Packet::GetDataAsFloat() const {
	if(msgType != TYPE_FLOAT)
		throw Exception("Packet::GetDataAsFloat: "
				"Packet is not of type 'TYPE_FLOAT'");

	uint32_t bits = data[0] << 24;
	bits |= data[1] << 16;
	bits |= data[2] << 8;
	bits |= data[3];

	return *(float*)(&bits);
}

void Hub::Packet::SetNodeID(unsigned int nodeID) {
	this->nodeID = nodeID;
}

void Hub::Packet::SetMsgType(unsigned char msgType) {
	this->msgType = msgType;
}

void Hub::Packet::SetData(const vector<unsigned char>& data) {
	this->data = data;
}
