#pragma once

#include <string>
#include <fstream>

class Thermometer {
public:
    void initialize();
    // Returns the current temperature in degrees Fahrenheit
    float getTemp();
private:
    std::string getDeviceName();
    std::string devicePath;
    std::ifstream sensor;
};
