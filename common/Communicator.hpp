#ifndef COMMUNICATOR_HPP
#define COMMUNICATOR_HPP

#include <string>
#include "Packet.hpp"
#include <memory>
#include <boost/asio.hpp>
#include <sstream>
#include <functional>
#include <stdint.h>
#include <thread>

using namespace std;

namespace Node {

class Communicator
{
public:

	Communicator(uint32_t nodeID, const string& remoteHostName,
			function<void(const Node::Packet&)> cbPacket);

	//int Connect();
	//int Disconnect();

	int SendPacket(const Node::Packet& p);

	int SendID();
	int SendInt(int32_t datapoint);
	int SendFloat(float datapoint);

private:
	static const int BUFFER_SIZE = 1;
	static const unsigned char PACKET_START_BYTE = 0xAA;

	int Connect();
	int Disconnect();

	bool isConnected;

	enum {
		STATE_READY,
		STATE_ID,
		STATE_TYPE,
		STATE_LENGTH,
		STATE_PAYLOAD
	} state;

	Node::Packet tempPacket;
	vector<unsigned char> tempData;

	void ProcessSingleByte(unsigned char byte);

	void ThreadRoutine();

	void StartListening();

	void cbReceive(const boost::system::error_code& error,
			size_t bytesTransferred);

	boost::asio::io_service ioService;
	unique_ptr<boost::asio::ip::tcp::socket> tcpSocket;

	thread asyncThread;

	unsigned char buffer[BUFFER_SIZE];

	uint32_t nodeID;
	string hostName;
	function<void(const Node::Packet&)> cbPacket;
};

}; //namespace Node

#endif
