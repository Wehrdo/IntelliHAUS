#include "Node.hpp"

Hub::Node::Node(function<void(const Packet&)> cbPacket, function<void(Node*)> cbClose) :
		comm([this](const Packet& packet){cbCheckPacket(packet);}),
		asyncThread([this](){ThreadRoutine();}) {

	tcpSocket.reset(new boost::asio::ip::tcp::socket(ioService));
	this->cbPacket = cbPacket;
	this->cbClose = cbClose;

	id = 0;

	//Flag to indicate thread close
	clientClose = false;
}

Hub::Node::~Node() {
	boost::system::error_code error;

	//Notify the async thread to stop
	clientClose = true;

	//Cleanly shutdown socket
	tcpSocket->shutdown(boost::asio::ip::tcp::socket::shutdown_send, error);

	if(error) {
		//I don't think I need to handle this error, we're gonna close it anyways
	}

	//Close the socket
	tcpSocket->close();

	//Cleanly wait for the async thread to finish
	asyncThread.join();
}

shared_ptr<boost::asio::ip::tcp::socket> Hub::Node::GetSocket() {
	return tcpSocket;
}

void Hub::Node::Start() {
	//Start an async read
	tcpSocket->async_receive(boost::asio::buffer(buffer, BUFFER_SIZE), 0,
			[this](const boost::system::error_code& error, size_t bytesTransferred) {
				cbReceive(error, bytesTransferred);
			});
}

void Hub::Node::SendPacket(const Packet& p) const {
	//Use the communicator to convert the packet into byte vector
	auto binaryMessage = Communicator::CreateBinaryMessage(p);

	//Make the (empty) callback lambda
	auto cbSend = [](const boost::system::error_code& error, size_t nSent) {
			//TODO: Check error code
			//cout << "Sent " << nSent << " bytes" << endl;
		};

	//Async send the data
	tcpSocket->async_send(boost::asio::buffer(binaryMessage), cbSend);
}

void Hub::Node::ThreadRoutine() {

	//stay alive while not clientClose
	while(!clientClose) {
		ioService.run();
		ioService.reset();

		this_thread::sleep_for(chrono::milliseconds(100));
	}

	//Call the external callback on close
	cbClose(this);
}

uint64_t Hub::Node::GetID() {
	return id;
}

void Hub::Node::cbCheckPacket(const Packet& packet) {

	//If we don't know the node id, take it from this packet
	if(id == 0) {
		id = packet.GetNodeID();
	}

	//Call external callback
	cbPacket(packet);
}

void Hub::Node::cbReceive(const boost::system::error_code& error, size_t bytesTransferred) {
	//if node has disconnected
	if(error) {
		clientClose = true;

		return;
	}

	//Run the received data through the state machine
	comm.ProcessBytes(vector<unsigned char>(begin(buffer), end(buffer)));

	//Continue reading bytes on the socket
	Start();
}

void Hub::Node::cbSend() {
	//TODO: Handle data send
}
