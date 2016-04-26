#ifndef PACKET_HPP
#define PACKET_HPP

#include <string>
#include <vector>
#include <cstdint>
#include "Exception.hpp"

using namespace std;

namespace Hub {
class Communicator;

	class Packet
	{
	public:
		//Message type defines
		static const unsigned char TYPE_ID = 0x00;
		static const unsigned char TYPE_INT = 0x01;
		static const unsigned char TYPE_FLOAT = 0x02;
		static const unsigned char TYPE_FLOATARRAY = 0x03;
		static const unsigned char TYPE_NODE_REQUEST = 0x04;
		static const unsigned char TYPE_DISCRETE = 0x05;

		//Default constructor
		Packet();

		//Constructor
		Packet(int nodeID, int msgType,
			const vector<unsigned char>& data);

		//static Packet FromInt(uint32_t nodeID, int32_t value)
		//Constructs and returns a packet from a given nodeID and 32bit integer
		//Param uint32_t nodeID : nodeID for new packet
		//Param int32_t value : value to pack into the packet
		static Packet FromInt(uint32_t nodeID, int32_t value);

		//unsigned int GetNodeID() const
		//Returns the nodeID of the packet
		//returns : unsigned int nodeID
		unsigned int GetNodeID() const;

		//unsigned char GetMsgType() const
		//Returns the message type of the packet
		//returns : unsigned int msgType
		unsigned char GetMsgType() const;

		//const vector<unsigned char>& GetData() const
		//Returns a const reference to the payload data of the packet
		//returns : const vector<unsigned char>& data
		const vector<unsigned char>& GetData() const;

		//int32_t GetDataAsInt() const
		//Parses the data as integer
		//Throws : Exception if msgType != TYPE_INT
		//returns : int32_t value as integer
		int32_t GetDataAsInt() const;

		//float GetDataAsFloat() const
		//Parses the data as float
		//Throws : Exception if msgType != TYPE_FLOAT
		//returns : float value as float
		float GetDataAsFloat() const;

		//void SetNodeID(unsigned int nodeID)
		//Sets the nodeID of the packet
		//Param  unsigned int nodeID : nodeID to set
		void SetNodeID(unsigned int nodeID);

		//void SetMsgType(unsigned char msgType)
		//Sets the msgType of the packet
		//Param unsigned char msgType : msgType to set
		void SetMsgType(unsigned char msgType);

		//void SetData(const vector<unsigned char>& data
		//Sets the data of the packet
		//Param : const vector<unsigned char>& : const reference to a byte vector
		void SetData(const vector<unsigned char>& data);

	private:
		//Let the communicator class directly access private members
		friend class Hub::Communicator;
		uint64_t nodeID;
		int msgType;
		vector<unsigned char> data;
	};
}

#endif
