#ifndef NODE_HPP
#define NODE_HPP

#include <queue>
#include <functional>
#include <thread>
#include <boost/asio.hpp>
#include <iostream>
#include <stdint.h>

#include "Packet.hpp"
#include "Communicator.hpp"
#include "Exception.hpp"

using namespace std;
//using namespace Hub;

namespace Hub {
class Node
{
public:
	Node(function<void(const Hub::Packet&)> cbPacket,
		function<void(Hub::Node*)> cbClose);

	~Node();

	shared_ptr<boost::asio::ip::tcp::socket> GetSocket();

	void Start();

	void SendPacket(const Packet& p) const;

	uint64_t GetID();
private:
	static const int BUFFER_SIZE = 1;

	bool clientClose;

	void ThreadRoutine();

	void cbCheckPacket(const Hub::Packet& packet);
	void cbReceive(const boost::system::error_code& error,
		size_t bytesTransferred);
	void cbSend();

	uint64_t id;

	unsigned char buffer[BUFFER_SIZE];

	Hub::Communicator comm;

	boost::asio::io_service ioService;
	shared_ptr<boost::asio::ip::tcp::socket> tcpSocket;
	thread asyncThread;

	function<void(const Hub::Packet&)> cbPacket;
	function<void(Hub::Node*)> cbClose;
};
}

#endif
