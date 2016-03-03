#include "Hub.hpp"

using namespace std;
using namespace Hub;

#define USERNAME	"Eric"
#define PASSWORD	"test1234"

#define HOMENAME	"Home1"
#define STREAMNAME	"Datastream1"

#define NODENAME	"Node1"
#define OUTPUTNAME	"Node1Output"

#define HOMEID		2
#define STREAMID	4

#define NODEID		3

using boost::asio::ip::tcp;

int main() {
	boost::asio::io_service io_service;

	tcp::acceptor acceptor(io_service, tcp::endpoint(tcp::v4(), 80));

	for(;;) {
		unsigned char buffer[1];
		vector<unsigned char> data;

		tcp::socket socket(io_service);
		acceptor.accept(socket);

		cout << "Client connected." << endl;
		boost::system::error_code error;

		while(!error) {
			int length = boost::asio::read(socket, boost::asio::buffer(buffer, 1), error);
			if(length > 0) {
				data.push_back(buffer[0]);
				cout << "Read " << length << " bytes." << endl;
			}
		}

		for(auto &b : data) {
			cout << (int)b << " ";
		}
		cout << endl;
	}




	Hub::Server server(SERVER_URL);

	int retVal = server.Connect();

	if(retVal < 0) {
		cout << "Error connecting to server." << endl;
		return -1;
	}
	try {
		float data = 0;

		cout << "Authenticating as user '" << USERNAME << "'..." << endl;
		retVal = server.Authenticate(USERNAME, PASSWORD);

		while(1) {
			data = (rand() % 1000) / 10.f;
			cout << "Sending datapoint '" << data << "'...";
			retVal = server.SendDatapoint(NODEID, data);
			cout << "done" << endl;

			std::this_thread::sleep_for(std::chrono::milliseconds(60000));
		}
	}
	catch(exception &e) {
		cout << "Exception caught: " << e.what() << endl;
	}

	server.Disconnect();

	return 0;
}
