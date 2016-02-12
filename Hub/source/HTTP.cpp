#include "HTTP.hpp"

namespace REST
{
HTTP::HTTP(string hostName) {
	boost::system::error_code error;

	this->hostName = hostName;

	//Initialize DNS resolver
	boost::asio::ip::tcp::resolver resolver(ioService);

	//Initialize resolver query
	boost::asio::ip::tcp::resolver::query query(hostName, "http");

	//Resolve IP addresses for hostName
	boost::asio::ip::tcp::resolver::iterator endpoint_iterator = resolver.resolve(query);

	//Create a socket
	tcpSocket.reset(new boost::asio::ip::tcp::socket(ioService));

	//Connect to the HTTP server
	boost::asio::connect(*tcpSocket, endpoint_iterator);
}

HTTP::~HTTP() {

}

string HTTP::Get(string path) {
	boost::asio::streambuf request, response;
	boost::system::error_code error;

	ostream requestStream(&request);
	istream responseStream(&response);

	stringstream outStream;

	requestStream << "GET " << path << " HTTP/1.0\r\n";
	requestStream << "Host: " << hostName << "\r\n";
	requestStream << "Accept: */*\r\n";
	requestStream << "Connection: close\r\n\r\n";

	boost::asio::write(*tcpSocket, request);

	boost::asio::read_until(*tcpSocket, response, "\r\n\r\n");

	string header;
	while(getline(responseStream, header) && header != "\r");

	if(response.size() > 0)
		outStream << &response;

	while(boost::asio::read(*tcpSocket, response, boost::asio::transfer_at_least(1), error))
		outStream << &response;

	if(error != boost::asio::error::eof)
		throw boost::system::system_error(error);

	return outStream.str();
}

};
