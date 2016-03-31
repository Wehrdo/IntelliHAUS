#include "HTTP.hpp"

using namespace std;
using namespace Hub;

Hub::HTTP::Message::Message() {

}

Hub::HTTP::Message::Message(const string& header, const string& body) : header(header), body(body) {

}

string Hub::HTTP::Message::GetHeader() const {
	return header;
}

string Hub::HTTP::Message::GetBody() const {
	return body;
}

void Hub::HTTP::Message::SetHeader(const string& header) {
	this->header = header;
}

void Hub::HTTP::Message::SetBody(const string& body) {
	this->body = body;
}

string Hub::HTTP::Message::ToString() const {
	return header + "\r\n" + body;
}


Hub::HTTP::HTTP(string hostName)
		: hostName(hostName),
		asyncThread([this](){ThreadRoutine();}) {
}

void Hub::HTTP::ThreadRoutine() {
	while(1) {
		ioService.run();
		ioService.reset();

		this_thread::sleep_for(chrono::milliseconds(10));
	}
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

//	try {
		//Connect to the HTTP server by iteratively trying all endpoints
		boost::asio::connect(*tcpSocket, endpoint_iterator);
//	}
//	catch(exception &e) {
//		return -1;
		//TODO: Return meaningfull error code
//	}

//	StartListening();

	return 0;
}

int Hub::HTTP::Disconnect() {
	boost::system::error_code error;

	//Disables sending and receiving to enable gracefull socket closure
	tcpSocket->shutdown(boost::asio::ip::tcp::socket::shutdown_send, error);

	//error occurred
	if(error) {
		//TODO: return meaningful error code
		return -1;
	}

	tcpSocket->close();

	while(!cbQueue.empty()) {
		//TODO: send the callback functions an error
		cbQueue.pop();
	}

	return 0;
}

Hub::HTTP::~HTTP() {

}

void Hub::HTTP::StartListening() {
	tcpSocket->async_receive(boost::asio::buffer(buffer, BUFFER_SIZE), 0,
			[this](const boost::system::error_code& error,
				size_t bytesTransferred) {
					cbReceive(error, bytesTransferred);
			});
}

void Hub::HTTP::cbReceive(const boost::system::error_code& error, size_t bytesTransferred) {
	for(int i = 0; i < bytesTransferred; i++) {
		//cout << "Received char: " << buffer[i] << endl;
//		cout << buffer[i];
		ProcessSingleChar(buffer[i]);
	}

	if(error) {
		if(error == boost::asio::error::eof)
			ProcessSingleChar('\0');
//		else {
			cout << "Receive error: " << error.message() << endl;
//		}
	}

	if(cbQueue.size() != 0)
		StartListening();
}

HTTP::Message HTTP::Get(const string& path, const string& header) {
	return HTTP::Message();
}

/* @param path: string containing path for request
 * @param header: HTTP header (not containing hostname)
 * with each line terminating in single '\r\n' (including last line)
 * @returns: HTTP::Header containing the response from the server
*/
void HTTP::GetAsync(const string &path, const string &header,
			function<void(const Message&)> callback) {
	boost::asio::streambuf request, response;
	boost::system::error_code error;

	ostream requestStream(&request);
	istream responseStream(&response);

	stringstream outStream;

	requestStream << "GET " << path << " HTTP/1.1\r\n";
	requestStream << "Host: " << hostName << "\r\n";
	requestStream << header << "\r\n";

	boost::asio::write(*tcpSocket, request);

	cbQueue.push(callback);

	StartListening();
}
/*

	boost::asio::read_until(*tcpSocket, response, "\r\n\r\n");

	string temp, responseHeader;

	while(getline(responseStream, temp) && temp != "\r")
		responseHeader += temp + "\r\n";

	int length = ParseBodyLength(responseHeader);

	int lengthNeeded = length - response.size();

	if(response.size() > 0)
		outStream << &response;

	boost::asio::read(*tcpSocket, response, boost::asio::transfer_exactly(lengthNeeded), error);

	outStream << &response;

	if(error != boost::asio::error::eof && error != boost::system::errc::success)
		throw boost::system::system_error(error);

	return Message(responseHeader, outStream.str());
}
*/
/* @param path: string containing path for request
 * @param postMessage: HTTP::Message containing the HTTP header and POST body
 * @returns: HTTP::Message containing the response from the server
 *
*/
Hub::HTTP::Message Hub::HTTP::Post(const string& path, const Hub::HTTP::Message& postMessage) {
	boost::asio::streambuf request, response;
	boost::system::error_code error;
	Message msg;

	ostream requestStream(&request);
	istream responseStream(&response);

	stringstream outStream;

	requestStream << "POST " << path << " HTTP/1.1\r\n";
	requestStream << "Host: " << hostName << "\r\n";
	requestStream << "Content-Length: " << postMessage.GetBody().length() << "\r\n";
	requestStream << postMessage.GetHeader() << "\r\n";
	requestStream << postMessage.GetBody();

	boost::asio::write(*tcpSocket, request);

	try {
		boost::asio::read_until(*tcpSocket, response, "\r\n\r\n");
	}
	catch(exception &e) {
		cout << "Exception: " << e.what() << endl;
		cout << "Data read so far: " << endl << &response << endl;
	}
	string temp, responseHeader;

	while(getline(responseStream, temp) && temp != "\r")
		responseHeader += temp + "\r\n";

	int lengthRemaining = ParseBodyLength(responseHeader) - response.size();

	if(response.size() > 0)
		outStream << &response;

	try {
		while(boost::asio::read(*tcpSocket, response, boost::asio::transfer_exactly(lengthRemaining), error))
			outStream << &response;
	}
	catch(exception &e) {
		cout << "Exception: " << e.what() << endl;
	}

	return Message(responseHeader, outStream.str());
}


int Hub::HTTP::ParseBodyLength(const string& header) {
	const string token = "Content-Length: ";

	int pos = FindInStrIC(header, token), retVal;

	if(pos < 0)
		return -1;

	stringstream stream(header.substr(pos + token.length()));
	stream >> retVal;

	return retVal;
}

void Hub::HTTP::ProcessSingleChar(char ch) {
	static enum {
		STATE_HEADER,
		STATE_BODY
	} state;
	static char lastChar = '\0';
	static Message currentMsg;
	static int nlCount;	//newline count
	static int bodyLength = 0;

	if(ch == '\0') {
		try {
			auto cb = cbQueue.front();
			cb(currentMsg);
			cbQueue.pop();
		}
		catch(exception &e) {
			cout << "Error popping callback routine in ProcessSingleChar: " << e.what() << endl;
		}

		state = STATE_HEADER;
		lastChar = '\0';
		currentMsg = Message();
		nlCount = 0;

		return;
	}

	if(state == STATE_HEADER) {
		currentMsg.header += ch;
		if(ch == '\n') {
			if(lastChar == '\r') {
				nlCount++;

				if(nlCount == 2) {
					bodyLength = ParseBodyLength(currentMsg.header);

					state = STATE_BODY;
					nlCount = 0;
				}
			}
			else
				nlCount = 0;
		}
		else if(ch != '\r') {
			nlCount = 0;
		}
		lastChar = ch;
	}
	else {
		currentMsg.body += ch;
		if(currentMsg.body.length() == bodyLength) {
			auto cb = cbQueue.front();
			cb(currentMsg);
			cbQueue.pop();

			currentMsg = Message();
		}
	}

	lastChar = ch;
}

int Hub::FindInStrIC(const string& haystack, const string& needle) {
	auto it = std::search(haystack.begin(), haystack.end(),
				needle.begin(), needle.end(),
				[](char ch1, char ch2) {return std::toupper(ch1) == std::toupper(ch2);});

	if(it == haystack.end())
		return -1;
	else
		return it - haystack.begin();
}
