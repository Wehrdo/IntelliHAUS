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
	//Default constructor
	NodeServer() : tcpAcceptor(ioService) {}

	//Constructor
	NodeServer(function<void(Hub::Packet)> cbPacket);

	//void Start()
	//Starts the node server (listens for and accepts TCP connections)
	void Start();

	//void Stop()
	//Stops the node server
	int Stop();

	//int SendPacket(const Packet& p)
	//Attempts to send a packet to a node if connected
	//Param const Packet& p : const reference to the packet to send
	int SendPacket(const Packet& p);

	//int SendActuation(uint32_t nodeID, const vector<float>& value)
	//Attemps to send an actuation array to a node if connected
	//Param uint32_t nodeID : id of node to actuate
	//Param const vector<float>& values : array of actuation values
	int SendActuation(uint32_t nodeID, const vector<float>& values);

	//bool IsNodeConnected(uint32_t id)
	//Check to see if the node is connected
	//Param uint32_t id : id of node to lookup
	//returns bool : true if connected, false otherwise
	bool IsNodeConnected(uint32_t id);

private:
	//Searches for a node by id and returns a pointer
	Hub::Node* GetNode(uint32_t id);

	//Removes a node from a pointer
	void RemoveNode(Hub::Node* node);

	//Async thread routine
	void ThreadRoutine();

	//Callback for TCP acceptor
	void AcceptHandler(Hub::Node *newNode,
		const boost::system::error_code& error);

	//Callback for node close
	void cbNodeClose(Hub::Node* node);

	//Callback for node packet read
	void cbNodeReadPacket(Hub::Packet packet);

	boost::asio::io_service ioService;
	boost::asio::ip::tcp::acceptor tcpAcceptor;

	thread asyncThread;

	//External callback for packet receive event
	function<void(Hub::Packet)> cbPacket;

	//vector of connected nodes
	vector<Hub::Node*> connectedNodes;
};

}

#endif
