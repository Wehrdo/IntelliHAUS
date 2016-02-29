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

int main() {
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

		for(int i = 0; i < 100; i++) {
			cout << "Sending datapoint " << i+1 << endl;
			server.SendDatapoint(NODEID, i + 1);
		}

		while(data >= 0) {
			cout << "Datapoint: ";
			cin >> data;
			cout << endl;

			retVal = server.SendDatapoint(NODEID, data);
		}
	}
	catch(exception &e) {
		cout << "Exception caught: " << e.what() << endl;
	}

	server.Disconnect();

	return 0;
}
