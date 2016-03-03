#ifndef COMMUNICATOR_HPP
#define COMMUNICATOR_HPP

#include <string>
//#include <function>
#include <memory>
#include <boost/asio.hpp>
#include <sstream>

using namespace std;

namespace Node {

class Communicator
{
public:
	class Packet
	{
	public:
		Packet();
		Packet(int nodeID, int msgType, const vector<char>& data);

		unsigned int GetNodeID() const;
		unsigned char GetMsgType() const;
		const vector<char>& GetData() const;

		void SetNodeID(unsigned int nodeID);
		void SetMsgType(unsigned char msgType);
		void SetData(const vector<char>& data);

	private:
		unsigned int nodeID;
		int msgType;
		vector<char> data;
	};

	Communicator(const string& remoteHostName);

	int Connect();
	int Disconnect();

	int SendPacket(const Packet& p);

	int PacketsReceived();

	Packet RetreivePacket();

//	int SetCallback(function<void(const Packet&)> cb);

private:
	boost::asio::io_service ioService;
	unique_ptr<boost::asio::ip::tcp::socket> tcpSocket;

	string hostName;
//	function<Packet> cb;

	vector<Packet> receiveBuffer;
};

}; //namespace Node

#endif
