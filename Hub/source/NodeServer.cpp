#include "NodeServer.hpp"


using namespace Hub;

Hub::NodeServer::NodeServer(function<void(Hub::Packet)> cbPacket) :
			tcpAcceptor(ioService, boost::asio::ip::tcp::endpoint(boost::asio::ip::tcp::v4(), 80)),
			asyncThread([this](){
				ThreadRoutine();}) {

	this->cbPacket = cbPacket;
}

void Hub::NodeServer::Start() {
	//lambda callback for packet read event
	auto fPacket = [this](const Packet& p){cbNodeReadPacket(p);};

	//lambda callback for node close event
	auto fClose = [this](Node *n) {cbNodeClose(n);};

	//Create a new node for the next TCP accept
	Node *newNode = new Node(fPacket, fClose);

	//Async accept on the newly created node
	tcpAcceptor.async_accept(*(newNode->GetSocket()),
			boost::bind(&Hub::NodeServer::AcceptHandler, this, newNode,
			boost::asio::placeholders::error));
}

int Hub::NodeServer::SendPacket(const Packet& p) {
	Node* node = GetNode(p.GetNodeID());

	//If the node is not currently connected
	if(node == nullptr)
		throw Exception(Error_Code::NODE_NOT_FOUND,
				"SendPacket exception: node not found");

	//Forward the packet to the node object for sending
	node->SendPacket(p);

	return 0;
}

int Hub::NodeServer::SendActuation(uint32_t nodeID, const vector<float>& values) {
	Node* node = GetNode(nodeID);

	//If the node is not currently connected
	if(node == nullptr)
		throw Exception(Error_Code::NODE_NOT_FOUND,
			"SendActuation exception: node not found");

	vector<unsigned char> data;

	//Start packing the data into the byte vector

	//Push 1 byte size
	data.push_back(values.size());

	//Push the ints onto the byte vector
	for(auto &v : values) {
		uint32_t bits = *(uint32_t*)(&v);

		data.push_back( (bits >> 24) & 0xFF);
		data.push_back( (bits >> 16) & 0xFF);
		data.push_back( (bits >> 8) & 0xFF);
		data.push_back( (bits) & 0xFF);
	}

	//Send the data
	node->SendPacket(Packet(nodeID, Packet::TYPE_FLOATARRAY, data));

	return values.size();
}

void Hub::NodeServer::ThreadRoutine() {
	while(1) {
		ioService.run();
		ioService.reset();

		this_thread::sleep_for(chrono::milliseconds(10));
	}
}

void Hub::NodeServer::AcceptHandler(Node *newNode, const boost::system::error_code& error) {
	if(!error) {
		//Start the node object operation
		newNode->Start();

		//Store this node in the vector
		connectedNodes.push_back(newNode);

		cout << "New node connected." << endl;
	}
	else {
		//Something went wrong, Let's start over.
		delete newNode;
		cout << "General Boost ASIO async_accept error." << endl;
	}

	//Get ready to accept another connection
	Start();
}

bool Hub::NodeServer::IsNodeConnected(uint32_t id) {
	for(auto &node : connectedNodes) {
		if(node->GetID() == id) {
			return true;
		}
	}

	return false;
}

Hub::Node* Hub::NodeServer::GetNode(uint32_t id) {
	for(auto &node : connectedNodes) {
		if(node->GetID() == id) {
			return node;
		}
	}
	
	return nullptr;
}

void Hub::NodeServer::RemoveNode(Node* node) {
	connectedNodes.erase(remove(connectedNodes.begin(), connectedNodes.end(), node),
				connectedNodes.end());
}

void Hub::NodeServer::cbNodeClose(Node* node) {
	cout << "Node " << node->GetID() << " disconnected." << endl;

	//Have the NodeServer thread delete the node instance
	ioService.post([this, node](){RemoveNode(node); delete node;});
}

void Hub::NodeServer::cbNodeReadPacket(Packet packet) {
	auto cbLambda = [&, this, packet](){
				cbPacket(packet);
			};

	//Have the NodeServer thread call the cbPakcet callback procedure
	ioService.post(cbLambda);
}
