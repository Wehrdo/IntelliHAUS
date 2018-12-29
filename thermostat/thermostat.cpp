#include <wiringPi.h>
#include <lcd.h>
#include "Adafruit_CharacterOLED.h"
#include "Thermometer.hpp"
#include "TempControl.hpp"
#include "EncoderWheel.hpp"
#include "Interface.hpp"

#include <iostream>
#include <cstdint>

#define ENCODER_PINA 4
#define ENCODER_PINB 5

int main() {
    wiringPiSetup();

    Thermometer temp_sensor;
    temp_sensor.initialize();

    Adafruit_CharacterOLED lcd(OLED_V2,
                               8, // rs
                               9, // rw
                               15, // enable
                               0, // d4
                               2, // d5
                               3, // d6
                               12 // d7
                               );
    Interface iface(lcd);

    EncoderWheel::setCallback([&](int dir){
        iface.notifyWheel(dir);
    });
    EncoderWheel::init(ENCODER_PINA, ENCODER_PINB);

    TempControl controller(1.5);

    while(1) {
        float cur_temp = temp_sensor.getTemp();
        std::cout << "Temp = " << cur_temp << " *F" << std::endl;
        controller.notifyCurTemp(cur_temp);
        iface.notifyCurTemp(cur_temp);
        // delayMicroseconds(900000);
    };
    return 0;
}
