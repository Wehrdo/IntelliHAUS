#ifndef PACKET_HPP
#define PACKET_HPP

#include <string>
#include <vector>

using namespace std;

namespace Node {
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
}

#endif
