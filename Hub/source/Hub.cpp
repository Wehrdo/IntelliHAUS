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

using namespace Hub;
using namespace Node;

#include <cerrno>

int main() {
	cout << "Starting Node Server" << endl;
	NodeServer nodeServer([](Hub::Node* node){
			cout << "Node connected: " << node->GetID() << endl;
			} );

	cout << "Created Node Server instance" << endl;

	this_thread::sleep_for(chrono::seconds(2));

	nodeServer.Start();

	cout << "Node Server started." << endl;

	while(1) {
		std::this_thread::sleep_for(std::chrono::seconds(1));
	}

	cout << errno << endl;

/*	boost::asio::io_service ioService;

	Hub::Server server(ioService, SERVER_URL);

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
*/
	return 0;
}
