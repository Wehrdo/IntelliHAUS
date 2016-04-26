#include "Communicator.hpp"

using namespace Node;

Node::Communicator::Communicator(uint32_t nodeID, const string& remoteHostName,
					function<void(const Packet&)> cbPacket)
				: hostName(remoteHostName),
				asyncThread([this](){ThreadRoutine();}) {
	this->nodeID = nodeID;
	this->cbPacket = cbPacket;

	state = STATE_READY;
	isConnected = false;

	//Connect on initialization
	Connect();

	cout << "Connector initialized with hostname: " << hostName << endl;
}

int Node::Communicator::Connect() {
	boost::system::error_code error;
	bool failed = true;

	try {
	//Initialize DNS resolver
	boost::asio::ip::tcp::resolver resolver(ioService);

	cout << "Connecting with hostname: " << hostName << endl;

	//Initialize DNS resolver query
	//TODO: Maybe pick a different port
	boost::asio::ip::tcp::resolver::query query(hostName, "http");

	//Resolve IP address from hostName
	auto endpointIterator = resolver.resolve(query);

	tcpSocket.reset(new boost::asio::ip::tcp::socket(ioService));

		//Try to connect to the server
		boost::asio::connect(*tcpSocket, endpointIterator);

		failed = false;
	}
	catch(exception &e) {
		cout << "Node::Communicator exception: " << e.what() << endl;
	}

	//If the connection failed, retry after 1 second
	if(failed) {
		this_thread::sleep_for(chrono::seconds(1));
		ioService.post([this](){Connect();});

		return -1;
	}
	else {
		isConnected = true;

		//Upon connection, send identification packet
		SendPacket(Packet(nodeID, Packet::TYPE_ID, vector<unsigned char>()));

		//Start the async receive loop
		StartListening();
	}

	return 0;
}

void Node::Communicator::StartListening() {
	//Start asynchronously listening for data
	tcpSocket->async_receive(boost::asio::buffer(buffer, BUFFER_SIZE), 0,
			[this](const boost::system::error_code& error, size_t bytesTransferred) {
				cbReceive(error, bytesTransferred);
			});
}

int Node::Communicator::Disconnect() {
	boost::system::error_code error;

	//Disables sending and receiving to enable a gracefull socket closure
	tcpSocket->shutdown(boost::asio::ip::tcp::socket::shutdown_send, error);

	//error occurred
	if(error) {
		//It doesn't matter, we're gonna close it anyways
	}

	tcpSocket->close();

	isConnected = false;

	return 0;
}

void Node::Communicator::ThreadRoutine() {
	while(1) {
		ioService.run();
		ioService.reset();

		this_thread::sleep_for(chrono::milliseconds(10));
	}
}

void Node::Communicator::ProcessSingleByte(unsigned char byte) {
        static int index = 0;
        static uint64_t tempID = 0;
        static uint64_t tempLength = 0;
        static Packet tempPacket;

				//Enter the communicator state machine
        switch(state) {
        case STATE_READY:
                if(byte == PACKET_START_BYTE) {
                        index = 0;
                        tempID = 0;
                        tempLength = 0;
                        tempPacket = Packet();
                        state = STATE_ID;
                }
        break;

        case STATE_ID:
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
                tempLength |= byte << (8 * (1 - index));
                index++;
                if(index == 2) {
                        if(tempLength == 0) {
																//if the length is 0, skip the payload state
																//call the external callback
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
                tempData.push_back(byte);

                if(tempData.size() == tempLength) {
                        tempPacket.data = tempData;

												//Call the external callback
                        cbPacket(tempPacket);
                        state = STATE_READY;
                }
        break;

        default:
                state = STATE_READY;
        }
}

void Node::Communicator::cbReceive(const boost::system::error_code& error,
				size_t bytesTransferred) {
	if(error) {
		cout << "General async_receive error" << endl;

		//Disconnect and reconnect on error
		Disconnect();

		ioService.post([this](){Connect();});

		return;
	}
	else {
		for(int i = 0; i < bytesTransferred; i++) {
			ProcessSingleByte(buffer[i]);
		}
	}

	//Keep listening
	StartListening();
}

int Node::Communicator::SendPacket(const Node::Packet& p) {

	if(!isConnected)
		return 0;

	vector<unsigned char> outData;

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

	int length = p.GetData().size();
	//Send Payload length
	outData.push_back( (length >> 8) & 0xFF);
	outData.push_back( (length) & 0xFF);

	//TODO: replace with std::move
	//Send payload
	for(auto &b : p.GetData())
		outData.push_back(b);

	int nWritten = 0;

	try {
		//Send the packet over TCP
		nWritten = boost::asio::write(*tcpSocket, boost::asio::buffer(outData));
	}
	catch(exception &e) {
		cout << "Write error: " << e.what() << endl;

		//On error, disconnect and attempt to reconnect
		Disconnect();

		ioService.post([this](){Connect();});

		return 0;
	}

	cout << "Bytes written: " << nWritten << endl;

	return nWritten;
}

int Node::Communicator::SendID() {
	//Send the empty identification packet
	Packet p(nodeID, Packet::TYPE_ID, vector<unsigned char>());

	return SendPacket(p);
}

int Node::Communicator::SendInt(int32_t datapoint) {
	vector<unsigned char> data;

	uint32_t dataBits = *(uint32_t*)(&datapoint);

	//Unpack the bits of the int
	data.push_back( (dataBits >> 24) & 0xFF);
	data.push_back( (dataBits >> 16) & 0xFF);
	data.push_back( (dataBits >> 8) & 0xFF);
	data.push_back( (dataBits) & 0xFF);

	Packet p(nodeID, Packet::TYPE_INT, data);

	return SendPacket(p);
}

int Node::Communicator::SendFloat(float datapoint) {
	vector<unsigned char> data;

	//Convert the bits of the datapoint float into an int
	//So we can do bitwise operations on the bits
	uint32_t dataBits = *(uint32_t*)(&datapoint);

	data.push_back( (dataBits >> 24) & 0xFF);
	data.push_back( (dataBits >> 16) & 0xFF);
	data.push_back( (dataBits >> 8) & 0xFF);
	data.push_back( (dataBits) & 0xFF);

	Packet p(nodeID, Packet::TYPE_FLOAT, data);

	return SendPacket(p);
}
