#ifndef PACKET_HPP
#define PACKET_HPP

#include <string>
#include <vector>
#include <cstdint>
#include "Exception.hpp"

using namespace std;

namespace Node {
class Communicator;

	class Packet
	{
	public:
		static const unsigned char TYPE_ID = 0x00;
		static const unsigned char TYPE_INT = 0x01;
		static const unsigned char TYPE_FLOAT = 0x02;
		static const unsigned char TYPE_FLOATARRAY = 0x03;
		static const unsigned char TYPE_DISCRETE = 0x05;

		Packet();
		Packet(int nodeID, int msgType,
			const vector<unsigned char>& data);

		static Packet FromInt(uint32_t nodeID, int32_t value);

		unsigned int GetNodeID() const;
		unsigned char GetMsgType() const;
		const vector<unsigned char>& GetData() const;

		int32_t GetDataAsInt() const;
		float GetDataAsFloat() const;
		vector<float> GetDataAsFloatArray() const;

		void SetNodeID(unsigned int nodeID);
		void SetMsgType(unsigned char msgType);
		void SetData(const vector<unsigned char>& data);

	private:
		friend class Communicator;
		uint64_t nodeID;
		int msgType;
		vector<unsigned char> data;
	};
}

#endif
