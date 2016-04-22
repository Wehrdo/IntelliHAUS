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

#include "Exception.hpp"

/*
	*HTTP.hpp
	*This file implements Hub::HTTP,
	*	an asynchronous HTTP client based on
	*	boost::asio
	*
	*
*/

using namespace std;
//using namespace Hub;

namespace Hub
{

class HTTP
{
public:

	//Class Message
	//This class contains a header and body string
	//For HTTP messages
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

	//Constructor
	//Param hostName: remote hostname
	//extCbConnect: function callback for connect event
	HTTP(string hostName, function<void()> extCbConnect);
	~HTTP();

	//IsConnected()
	//returns true if connected, false otherwise
	bool IsConnected();

	//Get()
	//Performs HTTP GET verb
	//Param path : path to GET
	//Param header : header to send to server
	//Param callback : function callback to call on GET response event
	void Get(const string &path, const string &header,
			function<void(const Message&)> callback);

	//Post()
	//Performs HTTP POST verb
	//Param path : path to POST
	//Param postMessage : HTTP::Message to send to server
	//Param callback : function callback to call on POST response event
	void Post(const string& path, const Message& postMessage,
			function<void(const Message&)> callback);

	//GetBlocking()
	//Performs blocking HTTP GET verb
	//Param path : path to GET
	//Param header : header to send to server
	Message GetBlocking(const string &path, const string& header);

	//PostiBlocking()
	//Performs blocking HTTP POST verb
	//Param path : path to POST
	//Param postMessage : HTTP::Message to send to server
	//returns HTTP::Message response from server
	Message PostBlocking(const string& path, const Message& postMessage);

private:
	//Receive buffer
	static const int BUFFER_SIZE = 128;
	char buffer[128];

	int Connect();
	int Disconnect();
	void Reconnect();

	//Starts an asynchronous read
	void StartListening();

	//Parses the length from the HTTP header
	int ParseBodyLength(const string& header);

	//Thread to process async callbacks
	void ThreadRoutine();

	//State machine to process HTTP responses
	void ProcessSingleChar(char ch);

	//Callback for receive complete event
	void cbReceive(const boost::system::error_code& error, size_t bytesTransferred);

	//Callback for server connect event
	void cbConnect(const boost::system::error_code& error);

	string hostName;
	boost::asio::io_service ioService;
	unique_ptr<boost::asio::ip::tcp::socket> tcpSocket;
	thread asyncThread;

	//Queue for callbacks for HTTP responses
	queue<function<void(const Message&)>> respQueue;
	function<void()> extCbConnect;
	bool isConnected;
};

//Helper function to find needle in haystack string, case insensitive
int FindInStrIC(const string& haystack, const string& needle);

} //namespace Hub

#endif //HTTP_HPP
