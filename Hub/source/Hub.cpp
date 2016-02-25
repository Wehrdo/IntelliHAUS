#include "Hub.hpp"

using namespace std;
using namespace Hub;

#define USERNAME	"Eric"
#define PASSWORD	"test1234"

int main() {
	//Hub::Server cloudServer("intellihaus.ece.iastate.edu");
	HTTP httpClient("intellihaus.ece.iastate.edu");
	HTTP::Message authMsg("Connection: close\r\n", string("{\"username\": \"") + USERNAME + "\",\r\n"
				"\"password\": \"" + PASSWORD + "\"}");

	int retVal = httpClient.Connect();

	if(retVal != 0) {
		cout << "Error connecting to server" << endl;
		return -1;
	}

//	HTTP::Message getResponse = httpClient.Get("/", "Connection: close\r\n");

//	cout << "Server GET response:\r\nHeader:\r\n" << getResponse.GetHeader() << endl
//			<< endl << getResponse.GetBody() << endl << endl;

	cout << "Attempting to authenticate..." << endl;
	cout << "Sending Message: " << endl << authMsg.ToString() << endl;

	HTTP::Message authResponse = httpClient.Post("/authenticate", authMsg);

	cout << "Authentication response: " << endl << authResponse.GetHeader() << endl
		<< endl << authResponse.GetBody() << endl << endl;

	httpClient.Disconnect();

	return 0;
}
