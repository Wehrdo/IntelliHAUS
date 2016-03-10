#include "Communicator.hpp"


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
	this->data = data;
}


Node::Communicator::Communicator(const string& remoteHostName)
				: hostName(remoteHostName) {
	cout << "Connector initialized with hostname: " << hostName << endl;
}

int Node::Communicator::Connect() {
	boost::system::error_code error;

	//Initialize DNS resolver
	boost::asio::ip::tcp::resolver resolver(ioService);

	cout << "Connecting with hostname: " << hostName << endl;

	//Initialize DNS resolver query
	//TODO: Maybe pick a different port
	boost::asio::ip::tcp::resolver::query query(hostName, "http");

	//Resolve IP address from hostName
	auto endpointIterator = resolver.resolve(query);

	tcpSocket.reset(new boost::asio::ip::tcp::socket(ioService));

	try {
		//Try to connect to the server
		boost::asio::connect(*tcpSocket, endpointIterator);
	}
	catch(exception &e) {
		cout << "Node::Communicator exception: " << e.what() << endl;
		return -1;
	}

	return 0;

}

int Node::Communicator::Disconnect() {
	boost::system::error_code error;

	//Disables sending and receiving to enable a gracefull socket closure
	tcpSocket->shutdown(boost::asio::ip::tcp::socket::shutdown_send, error);

	//error occurred
	if(error) {
		//TODO: return meaningful error code
		return -1;
	}

	tcpSocket->close();

	return 0;
}

int Node::Communicator::SendPacket(const Packet& p) {
	vector<char> outData;

	unsigned int nodeID = p.GetNodeID();
	unsigned char msgType = p.GetMsgType();

	//Send start byte
	outData.push_back(0xAA);

	//Send 4 byte Node ID
	outData.push_back(nodeID >> 24);
	outData.push_back( (nodeID >> 16) & 0xFF);
	outData.push_back( (nodeID >> 8) & 0xFF);
	outData.push_back( (nodeID) & 0xFF);

	//Send Message Type
	outData.push_back(msgType);

	//Send Payload length
	outData.push_back( (nodeID >> 8) & 0xFF);
	outData.push_back( (nodeID) & 0xFF);

	//Send payload
	for(auto &b : p.GetData())
		outData.push_back(b);

	//Send the packet over TCP
	int nWritten = boost::asio::write(*tcpSocket, boost::asio::buffer(outData));

	cout << "Bytes written: " << nWritten << endl;

	return 0;
}

int Node::Communicator::PacketsReceived() {
	return receiveBuffer.size();
}

/*
Packet Node::Communicator::RetreivePacket() {

}


int Node::Communicator::SetCallback(function<void(const Packet&)> cb) {
	this->cb = cb;
}

*/
