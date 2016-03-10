#include "Node.hpp"


Hub::Node::Node(function<void(Node::Packet)> cbPacket, function<void(Node*)> cbClose) :
		comm([this](const Node::Packet& packet){cbCheckPacket(packet);}),
		asyncThread([this](){ThreadRoutine();}) {

	tcpSocket.reset(new boost::asio::ip::tcp::socket(ioService));
	this->cbPacket = cbPacket;
	this->cbClose = cbClose;

	id = 0;
}

shared_ptr<boost::asio::ip::tcp::socket> Hub::Node::GetSocket() {
	return tcpSocket;
}

void Hub::Node::Start() {
	tcpSocket->async_receive(boost::asio::buffer(buffer, BUFFER_SIZE), 0,
			[this](const boost::system::error_code& error, size_t bytesTransferred) {
				cbReceive(error, bytesTransferred);
			});
}

void Hub::Node::ThreadRoutine() {
	while(1) {
//		cout << "Starting Node async thread." << endl;
		ioService.run();
		ioService.reset();

		this_thread::sleep_for(chrono::milliseconds(100));
	}
}

uint64_t Hub::Node::GetID() {
	return id;
}

void Hub::Node::cbCheckPacket(const Node::Packet& packet) {
	if(id == 0) {
		nodeID = packet.GetNodeID();
	}

	cbPacket(packet);
}

void Hub::Node::cbReceive(const boost::system::error_code& error, size_t bytesTransferred) {
	//Node has disconnected
	if(error) {
		cout << "Node disconnected." << endl;
		cbClose(this);

		return;
	}

	cout << "Received " << bytesTransferred << " bytes: ";

	for(auto byte: buffer) {
		cout << (int)byte << " ";
	}

	comm.ProcessBytes(vector<unsigned char>(begin(buffer), end(buffer)));

	cout << endl;

	Start();
}

void Hub::Node::cbSend() {
	//TODO: Handle data send
}
