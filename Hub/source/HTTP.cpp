#include "HTTP.hpp"

Hub::HTTP::HTTP(string hostName) : hostName(hostName) {
	//this->hostName = hostName;
}

int Hub::HTTP::Connect() {
	boost::system::error_code error;

	//Initialize DNS resolver
	boost::asio::ip::tcp::resolver resolver(ioService);

	//Initialize resolver query
	boost::asio::ip::tcp::resolver::query query(hostName, "http");

	//Resolve IP addresses for hostName
	boost::asio::ip::tcp::resolver::iterator endpoint_iterator = resolver.resolve(query);

	//Create a socket
	tcpSocket.reset(new boost::asio::ip::tcp::socket(ioService));

	try {
		//Connect to the HTTP server by iteratively trying all endpoints
		boost::asio::connect(*tcpSocket, endpoint_iterator);
	catch(Exception &e) {
		return -1;
		//TODO: Return meaningfull error code
	}
}

int Hub::HTTP:Disconnect() {
	boost::system::error_code error;

	//Disables sending and receiving to enable gracefull socket closure
	tcpSocket->shutdown(boost::asio::ip::tcp::socket::shutdown_send, error);

	//error occurred
	if(ec) {
		//TODO: return meaningful error code
		return -1;
	}

	tcpSocket->close();

	return 0;
}

Hub::HTTP::~HTTP() {

}

/* @param path: string containing path for request
 * @param header: HTTP header (not containing hostname)
 * with each line terminating in single '\r\n' (including last line)
 * @returns: HTTP::Header containing the response from the server
*/
Hub::HTTP::Header& Hub::HTTP::Get(const string &path, const string &header) {
	boost::asio::streambuf request, response;
	boost::system::error_code error;

	ostream requestStream(&request);
	istream responseStream(&response);

	stringstream outStream;

	requestStream << "GET " << path << " HTTP/1.1\r\n";
	requestStream << "Host: " << hostName << "\r\n";
	requestStream << header << "\r\n";

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

/* @param path: string containing path for request
 * @param postMessage: HTTP::Message containing the HTTP header and POST body
 * @returns: HTTP::Message containing the response from the server
 *
*/
Message& Hub::HTTP::Post(const string& path, const Hub::HTTP::Message& postMessage) {
	boost::asio::streambuf request, response;
	boost::system::error_code error;

	ostream requestStream(&request);
	istream responseStream(&response);

	stringstream outStream;

	requestStream << "POST " << path << " HTTP/1.1\r\n";
	requestStream << "Host: " << hostName << "\r\n";
	requestStream << postMessage.GetHeader() << "\r\n";
	requestStream << postMessage.GetBody();

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
