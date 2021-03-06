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


Hub::HTTP::HTTP(string hostName, function<void()> extCbConnect)
		: hostName(hostName),
		asyncThread([this](){ThreadRoutine();}) {

		this->extCbConnect = extCbConnect;

		Connect();
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

	boost::asio::ip::tcp::resolver::iterator endpointIterator;

	try {
		//Resolve IP addresses for hostName
		endpointIterator = resolver.resolve(query);
	}
	catch(exception &e) {
		cout << "Connect error: " << e.what() << endl;

		ioService.post([this]() {
			this_thread::sleep_for(chrono::seconds(1));
			Connect();
		});

		return -1;
	}

	//Create a socket
	tcpSocket.reset(new boost::asio::ip::tcp::socket(ioService));

	//boost::asio::connect(*tcpSocket, endpoint_iterator);
	tcpSocket->async_connect(*endpointIterator,
				[this](const boost::system::error_code& error){
					cbConnect(error);
				});

	return 0;
}

bool Hub::HTTP::IsConnected() {
	return isConnected;
}

void Hub::HTTP::cbConnect(const boost::system::error_code& error) {
	if(error) {
		cout << "Async connect error: " << error.message() << endl;

		//try again
		Connect();
	}
	else {
		isConnected = true;

		cout << "Async connected." << endl;

		//Notify on connection
		extCbConnect();

		//Start the async read
		StartListening();
	}
}

int Hub::HTTP::Disconnect() {
	boost::system::error_code error;

	isConnected = false;

	//Disables sending and receiving to enable gracefull socket closure
	tcpSocket->shutdown(boost::asio::ip::tcp::socket::shutdown_send, error);

	//error occurred
	if(error) {
		//TODO: return meaningful error code
		return -1;
	}

	tcpSocket->close();

	while(!respQueue.empty()) {
		//TODO: send the callback functions an error
		respQueue.pop();
	}

	return 0;
}

Hub::HTTP::~HTTP() {
	if(isConnected)
		Disconnect();
}

void Hub::HTTP::StartListening() {
	//Start an async read
	//for at least 1 byte
	//and call cbReceive on completion
	boost::asio::async_read(*tcpSocket,
				boost::asio::buffer(buffer, BUFFER_SIZE),
				boost::asio::transfer_at_least(1),
				[this](const boost::system::error_code& error,
				size_t bytesTransferred) {
					cbReceive(error, bytesTransferred);
				});
}

void Hub::HTTP::cbReceive(const boost::system::error_code& error, size_t bytesTransferred) {
	//Process each character individually
	//with the HTTP receive state machine
	for(int i = 0; i < bytesTransferred; i++) {
		ProcessSingleChar(buffer[i]);
	}

	if(error) {
		Disconnect();

		cout << "Disconnected from server" << endl;

		//Try to reconnect
		Connect();
	}
	else
		StartListening();
}

/* @param path: string containing path for request
 * @param header: HTTP header (not containing hostname)
 * with each line terminating in single '\r\n' (including last line)
 * @returns: HTTP::Header containing the response from the server
*/
void HTTP::Get(const string &path, const string &header,
			function<void(const Message&)> callback) {
	if(!isConnected)
		throw Exception(Error_Code::HTTP_NOT_CONNECTED, "HTTP Exception: Not connected.");

	boost::asio::streambuf request, response;
	boost::system::error_code error;

	ostream requestStream(&request);
	istream responseStream(&response);

	stringstream outStream;

	//Build the request header
	requestStream << "GET " << path << " HTTP/1.1\r\n";
	requestStream << "Host: " << hostName << "\r\n";
	requestStream << header << "\r\n";

	//Send the request synchronously
	boost::asio::write(*tcpSocket, request);

	int queueSize = respQueue.size();
	
	//Use the async thread to push the callback onto the queue
	ioService.post([this, callback]() {
		respQueue.push(callback);
	});
}


/* @param path: string containing path for request
 * @param postMessage: HTTP::Message containing the HTTP header and POST body
 * @returns: HTTP::Message containing the response from the server
 *
*/
void Hub::HTTP::Post(const string& path, const Hub::HTTP::Message& postMessage,
					function<void(const Message&)> callback) {
	if(!isConnected)
		throw Exception(Error_Code::HTTP_NOT_CONNECTED, "HTTP Exception: Not connected.");

	boost::asio::streambuf request, response;
	boost::system::error_code error;
	Message msg;

	ostream requestStream(&request);
	istream responseStream(&response);

	stringstream outStream;

	//Build the HTTP header
	requestStream << "POST " << path << " HTTP/1.1\r\n";
	requestStream << "Host: " << hostName << "\r\n";
	requestStream << "Content-Length: " << postMessage.GetBody().length() << "\r\n";
	requestStream << postMessage.GetHeader() << "\r\n";
	requestStream << postMessage.GetBody();

	//Perform syncronous write
	boost::asio::write(*tcpSocket, request);

	int queueSize = respQueue.size();

	//Use the async thread to push the callback onto the queue
	ioService.post([this, callback](){
		respQueue.push(callback);
	});
}


Hub::HTTP::Message Hub::HTTP::GetBlocking(const string& path, const string& header) {
	if(!isConnected)
		throw Exception(Error_Code::HTTP_NOT_CONNECTED, "HTTP Exception: Not connected.");

	Message msg;

	//Used to safely block until the GET request has completed
	mutex blockMutex;

	blockMutex.lock();

	//Use lambda callback to unblock mutex when complete
	Get(path, header, [&blockMutex, &msg](const Message& message) {
			msg = message;
			blockMutex.unlock();
		});

	//Block until lambda callback is called
	blockMutex.lock();

	return msg;
}

Hub::HTTP::Message Hub::HTTP::PostBlocking(const string& path, const Hub::HTTP::Message& postMessage) {
	if(!isConnected)
		throw Exception(Error_Code::HTTP_NOT_CONNECTED, "HTTP Exception: Not connected.");

	Message msg;
	mutex blockMutex;

	blockMutex.lock();

	Post(path, postMessage, [&blockMutex, &msg](const Message& message) {
			msg = message;
			blockMutex.unlock();
		});

	blockMutex.lock();

	return msg;

}

int Hub::HTTP::ParseBodyLength(const string& header) {
	const string token = "Content-Length: ";

	//Search the header for "Content-Length:" value
	int pos = FindInStrIC(header, token), retVal;

	if(pos < 0)
		return -1;

	//Parse the value
	stringstream stream(header.substr(pos + token.length()));
	stream >> retVal;

	return retVal;
}

void Hub::HTTP::ProcessSingleChar(char ch) {
	//State machine states
	static enum {
		STATE_HEADER,
		STATE_BODY
	} state = STATE_HEADER;

	static char lastChar = '\0';
	static Message currentMsg = Message();
	static int nlCount = 0;
	static int bodyLength = 0;

	if(state == STATE_HEADER) {
		currentMsg.header += ch;

		//Check if newline (\r\n)
		if(ch == '\n') {
			if(lastChar == '\r') {
				nlCount++;
				
				//The header is over after two consecutive newlines
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
			auto cb = respQueue.front();
			cb(currentMsg);
			respQueue.pop();

			currentMsg = Message();
			state = STATE_HEADER;
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
