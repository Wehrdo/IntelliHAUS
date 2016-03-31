#include "NodeServer.hpp"

//using boost::asio;

using namespace Hub;

Hub::NodeServer::NodeServer(function<void(Hub::Packet)> cbPacket) :
			tcpAcceptor(ioService, boost::asio::ip::tcp::endpoint(boost::asio::ip::tcp::v4(), 80)),
			asyncThread([this](){
				ThreadRoutine();}) {
	this->cbPacket = cbPacket;

//	boost::asio::ip::tcp::endpoint endpoint(boost::asio::ip::tcp::v4(), 80);

//	tcpAcceptor.open(endpoint.protocol());
//	tcpAcceptor.bind(endpoint);
}

void Hub::NodeServer::Start() {
	auto fPacket = [this](const Packet& p){cbNodeReadPacket(p);};
	auto fClose = [this](Node *n) {cbNodeClose(n);};

//	boost::asio::ip::tcp::endpoint endpoint(boost::asio::ip::tcp::v4(), 80);

	Node *newNode = new Node(fPacket, fClose);

//	tcpAcceptor.accept(*(newNode->GetSocket()));

	tcpAcceptor.async_accept(*(newNode->GetSocket()),
			boost::bind(&Hub::NodeServer::AcceptHandler, this, newNode,
			boost::asio::placeholders::error));
}

int Hub::NodeServer::SendPacket(const Packet& p) {
	Node* node = GetNode(p.GetNodeID());

	if(node == nullptr)
		throw Exception("SendPacket exception: node not found");

	node->SendPacket(p);

	return 0;
}

void Hub::NodeServer::ThreadRoutine() {
	while(1) {
//		cout << "Starting NodeServer async thread." << endl;
		ioService.run();
		ioService.reset();
//		cout << "Ending NodeServer async thread." << endl;

		this_thread::sleep_for(chrono::milliseconds(10));
	}
}

void Hub::NodeServer::AcceptHandler(Node *newNode, const boost::system::error_code& error) {
//	cout << "Accept handler entry" << endl;
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

bool Hub::NodeServer::IsNodeConnected(uint32_t id) {
	//TODO: Replace with std::find
	for(auto &node : connectedNodes) {
		if(node->GetID() == id) {
			return true;
		}
	}

	return false;
}

Hub::Node* Hub::NodeServer::GetNode(uint32_t id) {
	//TODO: replace with std::find
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
	cout << "Node " << node->GetID() << " disconnected." << endl;

	//Have the NodeServer thread delete the node instance
	ioService.post([this, node](){RemoveNode(node); delete node;});
}

void Hub::NodeServer::cbNodeReadPacket(Packet packet) {
	auto cbLambda = [&, this, packet](){
//				cout << "Calling cbPacket inside NodeServer thread." << endl;
				cbPacket(packet);
			};

	//Have the NodeServer thread call the cbPakcet callback procedure
	ioService.post(cbLambda);
}
