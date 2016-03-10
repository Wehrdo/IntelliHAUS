#ifndef NODE_HPP
#define NODE_HPP

#include <queue>
#include <functional>
#include <thread>
#include <boost/asio.hpp>
#include <iostream>
#include <stdint.h>

using namespace std;
//using namespace Hub;
//using namespace Node;

namespace Hub {
class Node
{
public:
	Node(function<void(Node*)> cbPacket, function<void(Node*)> cbClose);

	shared_ptr<boost::asio::ip::tcp::socket> GetSocket();

	void Start();

	uint64_t GetID();
private:
	static const int BUFFER_SIZE = 1;

	void ThreadRoutine();

	void cbCheckPacket(const Node::Packet& packet);
	void cbReceive(const boost::system::error_code& error, size_t bytesTransferred);
	void cbSend();

	uint64_t id;

	unsigned char buffer[BUFFER_SIZE];

	Communicator comm;
	boost::asio::io_service ioService;
	shared_ptr<boost::asio::ip::tcp::socket> tcpSocket;
	thread asyncThread;

	function<void(Node::Packet)> cbPacket;
	function<void(Node*)> cbClose;
};
}

#endif
