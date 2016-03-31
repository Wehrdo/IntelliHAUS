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

	int Connect();
	int Disconnect();

	bool IsConnected();

	Message Get(const string &path, const string &header);
	Message Post(const string &path, const Message &postMessage);

	void GetAsync(const string &path, const string &header,
			function<void(const Message&)> callback);


private:
	static const int BUFFER_SIZE = 1;
	char buffer[1];

	void StartListening();
	int ParseBodyLength(const string& header);
	void ThreadRoutine();
	void ProcessSingleChar(char ch);
	void cbReceive(const boost::system::error_code& error, size_t bytesTransferred);

	string hostName;
	boost::asio::io_service ioService;
	unique_ptr<boost::asio::ip::tcp::socket> tcpSocket;
	thread asyncThread;
	queue<function<void(const Message&)>> cbQueue;
};

int FindInStrIC(const string& haystack, const string& needle);

} //namespace Hub

#endif //HTTP_HPP
