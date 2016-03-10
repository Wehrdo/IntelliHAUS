#ifndef NODESERVER_HPP
#define NODESERVER_HPP

#include <boost/asio.hpp>
#include <boost/bind.hpp>
#include <functional>
#include <thread>
#include <stdint.h>
#include "Packet.hpp"
#include "Exception.hpp"
#include "Node.hpp"

using namespace std;
using namespace Hub;
using namespace Node;

namespace Hub
{

class NodeServer
{
public:
	NodeServer(function<void(Node*)> cbConnect);

	void Start();

	int Stop();

	bool IsNodeConnected(uint64_t id);
	Node* GetNode(uint64_t id);

	void RemoveNode(Node* node);
private:
	void ThreadRoutine();

	void AcceptHandler(Node *newNode, const boost::system::error_code& error);

	void cbNodeClose(Node* node);
	void cbNodeReadPacket(Node* node);

	boost::asio::io_service ioService;
	boost::asio::ip::tcp::acceptor tcpAcceptor;

	thread asyncThread;

	function<void(Node*)> cbConnect;

	vector<Node*> connectedNodes;
};

}

#endif
