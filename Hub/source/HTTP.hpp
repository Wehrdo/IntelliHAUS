#ifndef HTTP_HPP
#define HTTP_HPP

#include <boost/asio.hpp>
#include <array>
#include <string>
#include <iostream>
#include <memory>
#include <sstream>
#include <thread>
#include <functional>
#include <queue>
#include <mutex>

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
			friend class HTTP;
			string header, body;
	};

	HTTP(string hostName);
	~HTTP();

	bool IsConnected();

	void Get(const string &path, const string &header,
			function<void(const Message&)> callback);

	void Post(const string& path, const Message& postMessage,
			function<void(const Message&)> callback);

	Message GetBlocking(const string &path, const string& header);

	Message PostBlocking(const string& path, const Message& postMessage);

private:
	static const int BUFFER_SIZE = 128;
	char buffer[128];

	int Connect();
	int Disconnect();

	void Reconnect();
	void StartListening();
	int ParseBodyLength(const string& header);
	void ThreadRoutine();
	void ProcessSingleChar(char ch);
	void cbReceive(const boost::system::error_code& error, size_t bytesTransferred);

	string hostName;
	boost::asio::io_service ioService;
	unique_ptr<boost::asio::ip::tcp::socket> tcpSocket;
	thread asyncThread;
	queue<function<void(const Message&)>> respQueue;
	bool isConnected;
};

int FindInStrIC(const string& haystack, const string& needle);

} //namespace Hub

#endif //HTTP_HPP
