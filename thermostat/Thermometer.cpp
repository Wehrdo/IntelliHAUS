#include "Thermometer.hpp"
#include "Exceptions.hpp"

#include <dirent.h>

using std::string;

#define SENSOR_DIR	"/sys/bus/w1/devices/"

void Thermometer::initialize() {
    // Find the thermometer
    string sensor_name = GetSensorName();
    if (sensor_name.length() == 0) {
        throw DangerousException("No thermometer found");
    }
    devicePath = SENSOR_DIR + GetSensorName() + "/w1_slave";

}

float Thermometer::getTemp() {
    // Open sensor
    std::ifstream sensor(sensorPath);
    // Verify successful opening
    if(!sensor.is_open()) {
        throw DangerousException("Couldn't open thermometer at " + sensor_name);
    }

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
        break;
    }
    sensor.close();
    return temp;
}

string Thermometer::getDeviceName() {
    DIR *dir = opendir(SENSOR_DIR);

    dirent *dp;
    string fileName;

    while((dp=readdir(dir)) != NULL) {
        fileName = string(dp->d_name);

        // DS18B20 always starts with 28
        if(	fileName.length() > 2 &&
            fileName[0] == '2' &&
            fileName[1] == '8' ) {

            return fileName;
        }
    }
    closedir(dir);

    return string();
}