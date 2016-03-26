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

namespace Hub
{

class NodeServer
{
public:
	NodeServer(function<void(Hub::Packet)> cbPacket);

	void Start();

	int Stop();

	int SendPacket(const Packet& p);

	bool IsNodeConnected(uint32_t id);
private:
	Hub::Node* GetNode(uint32_t id);
	void RemoveNode(Hub::Node* node);

	void ThreadRoutine();

	void AcceptHandler(Hub::Node *newNode,
		const boost::system::error_code& error);

	void cbNodeClose(Hub::Node* node);
	void cbNodeReadPacket(Hub::Packet packet);

	boost::asio::io_service ioService;
	boost::asio::ip::tcp::acceptor tcpAcceptor;

	thread asyncThread;

	function<void(Hub::Packet)> cbPacket;

	vector<Hub::Node*> connectedNodes;
};

}

#endif
