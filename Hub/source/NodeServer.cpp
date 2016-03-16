#include "NodeServer.hpp"

//using boost::asio;

Hub::NodeServer::NodeServer(function<void(Node*)> cbConnect) :
			tcpAcceptor(ioService, boost::asio::ip::tcp::endpoint(boost::asio::ip::tcp::v4(), 80)),
			asyncThread([this](){
				ThreadRoutine();}) {
	this->cbConnect = cbConnect;

//	boost::asio::ip::tcp::endpoint endpoint(boost::asio::ip::tcp::v4(), 80);

//	tcpAcceptor.open(endpoint.protocol());
//	tcpAcceptor.bind(endpoint);
}

void Hub::NodeServer::Start() {
	auto fConnect = [this](Node* node){cbConnect(node);};
	auto fPacket = [this](Node* node){cbNodeReadPacket(node);};

//	boost::asio::ip::tcp::endpoint endpoint(boost::asio::ip::tcp::v4(), 80);

	Node *newNode = new Node(fConnect, fPacket);

//	tcpAcceptor.accept(*(newNode->GetSocket()));

	cout << "Starting TCP acceptor" << endl;

	tcpAcceptor.async_accept(*(newNode->GetSocket()),
			boost::bind(&Hub::NodeServer::AcceptHandler, this, newNode,
			boost::asio::placeholders::error));

	cout << "Done starting TCP acceptor" << endl;
}

void Hub::NodeServer::ThreadRoutine() {
	while(1) {
//		cout << "Starting NodeServer async thread." << endl;
		ioService.run();
		ioService.reset();
//		cout << "Ending NodeServer async thread." << endl;

		this_thread::sleep_for(chrono::milliseconds(100));
	}
}

void Hub::NodeServer::AcceptHandler(Node *newNode, const boost::system::error_code& error) {
	cout << "Accept handler entry" << endl;
	if(!error) {
		newNode->Start();
		connectedNodes.push_back(newNode);
		cout << "New node connected." << endl;
	}
	else {
		delete newNode;
		cout << "General Boost ASIO async_accept error." << endl;
	}

	Start();
}

bool Hub::NodeServer::IsNodeConnected(uint64_t id) {
	for(auto &node : connectedNodes) {
		if(node->GetID() == id) {
			return true;
		}
	}

	return false;
}

Hub::Node* Hub::NodeServer::GetNode(uint64_t id) {
	for(auto &node : connectedNodes) {
		if(node->GetID() == id) {
			return node;
		}
	}

	//throw Hub::Exception("NodeServer::GetNode exception: node " + to_string(id) " not found");
	return nullptr;
}

void Hub::NodeServer::RemoveNode(Node* node) {
	connectedNodes.erase(remove(connectedNodes.begin(), connectedNodes.end(), node),
				connectedNodes.end());
}

void Hub::NodeServer::cbNodeClose(Node* node) {
	ioService.post([this, node](){RemoveNode(node); delete node;});
}

void Hub::NodeServer::cbNodeReadPacket(const Node::Packet& packet) {
	//TODO: something
	cout << "Received packet:" << endl;
	cout << "ID: " << packet.GetNodeID << ", Type: " << packet.GetMsgType()
		<< ", Data: ";

	for(auto &byte : packet.GetData()) {
		cout << (int)byte << " ";
	}

	cout << endl;
}
