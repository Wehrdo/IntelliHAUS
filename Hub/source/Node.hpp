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

/*
	*Node.hpp
	*Implements class Hub::Node, which contains all information for a connected Node
	*
	*
	*
*/

using namespace std;
//using namespace Hub;

namespace Hub {
class Node
{
public:
	//Constructor
	Node(function<void(const Hub::Packet&)> cbPacket,
		function<void(Hub::Node*)> cbClose);

	//Deconstructor
	~Node();

	//GetSocket
	//returns : shared_ptr<boost::asio::ip::tcp::socket>
	shared_ptr<boost::asio::ip::tcp::socket> GetSocket();

	//void Start()
	//Start the connection
	void Start();

	//void SendPacket(const Packet& p) const
	//Send a packet to the Node
	//Param const Packet& p : reference to packet to send
	void SendPacket(const Packet& p) const;

	//uint64_t GetID()
	//Returns the ID of the node if identified, 0 otherwise
	//Return : uint64_t
	uint64_t GetID();

private:
	static const int BUFFER_SIZE = 1;

	bool clientClose;

	//async thread routine
	void ThreadRoutine();

	//Callback for packet check event
	void cbCheckPacket(const Hub::Packet& packet);

	//Callback for async receive event
	void cbReceive(const boost::system::error_code& error,
		size_t bytesTransferred);

	//Callback for async send event
	void cbSend();

	uint64_t id;

	//async receive buffer
	unsigned char buffer[BUFFER_SIZE];

	//Communicator state machine
	Hub::Communicator comm;

	boost::asio::io_service ioService;
	shared_ptr<boost::asio::ip::tcp::socket> tcpSocket;
	thread asyncThread;

	//External callbacks
	function<void(const Hub::Packet&)> cbPacket;
	function<void(Hub::Node*)> cbClose;
};
}

#endif
