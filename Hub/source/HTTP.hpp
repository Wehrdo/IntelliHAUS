#ifndef HTTP_HPP
#define HTTP_HPP

#include <boost/asio.hpp>
#include <array>
#include <string>
#include <iostream>
#include <memory>
#include <sstream>

using namespace std;
//using namespace Hub;

namespace Hub
{

class HTTP
{
public:
	class Message
	{
		public:
			Message();
			Message(const string& header, const string& body);

			string GetHeader() const;
			string GetBody() const;

			void SetHeader(const string &header);
			void SetBody(const string &body);

			string ToString() const;

		private:
			string header, body;
	};

	HTTP(string hostName);
	~HTTP();

	int Connect();
	int Disconnect();

	bool IsConnected();

	Message Get(const string &path, const string &header);

	Message Post(const string &path, const Message &postMessage);

private:
	int ParseBodyLength(const string& header);
	string hostName;
	boost::asio::io_service ioService;
	unique_ptr<boost::asio::ip::tcp::socket> tcpSocket;
};

int FindInStrIC(const string& haystack, const string& needle);

} //namespace Hub

#endif //HTTP_HPP
