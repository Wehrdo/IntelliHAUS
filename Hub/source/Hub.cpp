#include "Hub.hpp"

using namespace std;
using namespace Hub;

#define USERNAME	"Eric"
#define PASSWORD	"test1234"

int main() {
	Hub::Server server(SERVER_URL);

	int retVal = server.Connect();

	if(retVal < 0) {
		cout << "Error connecting to server." << endl;
		return -1;
	}
	try {
		retVal = server.CreateUser("test1", "test1234", "Test", "Test", "test@test.test");
	}
	catch(exception &e) {
		cout << "Exception caught: " << e.what() << endl;
	}

	server.Disconnect();

	return 0;
}
