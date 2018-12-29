#pragma once
#include "Adafruit_CharacterOLED.h"

#include <memory>
#include <string>

class Interface {
public:
    Interface(Adafruit_CharacterOLED screen);
    void notifyCurTemp(float temp);
    void notifyWheel(int dir);
private:
    std::string string_format(const std::string fmt, ...);

    Adafruit_CharacterOLED screen;
    float curTemp;
};