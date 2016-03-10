#ifndef PACKET_HPP
#define PACKET_HPP

#include <string>
#include <vector>
#include <cstdint>

using namespace std;


namespace Node {
	class Packet
	{
	public:
		static const unsigned char TYPE_IDENTIFY = 0;
		static const unsigned char TYPE_DATAPOINT = 1;

		Packet();
		Packet(int nodeID, int msgType, const vector<char>& data);

		unsigned int GetNodeID() const;
		unsigned char GetMsgType() const;
		const vector<char>& GetData() const;

		void SetNodeID(unsigned int nodeID);
		void SetMsgType(unsigned char msgType);
		void SetData(const vector<char>& data);

	private:
		uint64_t nodeID;
		int msgType;
		vector<char> data;
	};
}

#endif
