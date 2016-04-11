#include "Temp.hpp"

#define DELAY		1000
#define SENSOR_DIR	"/sys/bus/w1/devices/"
#define SENSOR_REGEX	"28_*"
#define NODE_ID		2

using namespace std;
using namespace Node;

void cbPacket(const Packet& p);
string GetSensorName(void);

int main() {
	string sensorPath = SENSOR_DIR + GetSensorName() + "/w1_slave";

	cout << "Sensor path: " << sensorPath << endl;

	Communicator comm(NODE_ID, "intellihub.ece.iastate.edu", cbPacket);

	this_thread::sleep_for(chrono::seconds(2));

	comm.Connect();

	for(;;) {
		ifstream sensor(sensorPath);

		if(!sensor.is_open()) {
			cout << "Error: unable to open sensor at " << sensorPath << endl;
		}
		else {
			string line;
			float temp;

			while(getline(sensor, line)) {
				int tempPos = line.find("t=");

				if(tempPos == string::npos)
					continue;

				string tempStr = line.substr(tempPos + 2);

				try {
					temp = stoi(tempStr) / 1000.f;
				}
				catch(exception &e) {
					cout << "Exception trying to convert '" << tempStr <<
						"' to integer" << endl;

					continue;
				}

				temp = temp * 9.f / 5.f + 32.f;

				cout << "Temperature: " << temp << endl;

				break;
			}

			comm.SendFloat(temp);
			sensor.close();
		}

		this_thread::sleep_for(chrono::milliseconds(DELAY));
	}

	comm.Disconnect();

	return 0;
}

string GetSensorName() {
	DIR *dir = opendir(SENSOR_DIR);

	dirent *dp;
	string fileName;

	while((dp=readdir(dir)) != NULL) {
		fileName = string(dp->d_name);

		if(	fileName.length() > 2 &&
			fileName[0] == '2' &&
			fileName[1] == '8' ) {

			return fileName;
		}

	}

	closedir(dir);

	return string();
}


void cbPacket(const Packet& p) {

	switch(p.GetMsgType()) {
	case Packet::TYPE_INT:
		cout << "Received int: " << p.GetDataAsInt() << endl;
	break;

	case Packet::TYPE_FLOAT:
		cout << "Received float: " << p.GetDataAsFloat() << endl;
	break;

	default:
		cout << "Received non int/float packet" << endl;
	}
}
