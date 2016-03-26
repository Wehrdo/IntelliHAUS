#include "Node.hpp"

Hub::Node::Node(function<void(const Packet&)> cbPacket, function<void(Node*)> cbClose) :
		comm([this](const Packet& packet){cbCheckPacket(packet);}),
		asyncThread([this](){ThreadRoutine();}) {

	tcpSocket.reset(new boost::asio::ip::tcp::socket(ioService));
	this->cbPacket = cbPacket;
	this->cbClose = cbClose;

	id = 0;

	clientClose = false;
}

Hub::Node::~Node() {
	boost::system::error_code error;

	//Notify the async thread to stop
	clientClose = true;

	//Cleanly shutdown socket
	tcpSocket->shutdown(boost::asio::ip::tcp::socket::shutdown_send, error);

	if(error) {
//		throw Hub::Exception("~Node exception: "
//					"Generic socket::shutdown error");
		//TODO: Maybe handle this error
	}

	tcpSocket->close();

	//Cleanly wait for the async thread to finish
	asyncThread.join();

//	cout << "Node deleted." << endl;
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

void Hub::Node::SendPacket(const Packet& p) const {
	auto binaryMessage = Communicator::CreateBinaryMessage(p);

	auto cbSend = [](const boost::system::error_code& error, size_t nSent) {
			//TODO: Check error code
			//cout << "Sent " << nSent << " bytes" << endl;
		};

	tcpSocket->async_send(boost::asio::buffer(binaryMessage), cbSend);
}

void Hub::Node::ThreadRoutine() {
	while(!clientClose) {
		ioService.run();
		ioService.reset();

		this_thread::sleep_for(chrono::milliseconds(100));
	}
	cbClose(this);
}

uint64_t Hub::Node::GetID() {
	return id;
}

void Hub::Node::cbCheckPacket(const Packet& packet) {
	if(id == 0) {
		id = packet.GetNodeID();
	}

	cbPacket(packet);
}

void Hub::Node::cbReceive(const boost::system::error_code& error, size_t bytesTransferred) {
	//Node has disconnected
	if(error) {
//		cout << "Node disconnected." << endl;
		clientClose = true;

		return;
	}

	comm.ProcessBytes(vector<unsigned char>(begin(buffer), end(buffer)));

	//Continue reading bytes on the socket
	Start();
}

void Hub::Node::cbSend() {
	//TODO: Handle data send
}
