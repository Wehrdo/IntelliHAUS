#include <wiringPi.h>
#include "Adafruit_CharacterOLED.h"
#include "Thermometer.hpp"

#include <iostream>
#include <cstdint>

#define ENCODER_PINA 4
#define ENCODER_PINB 5

void setupEncoder();
void encoderISR();

int main() {
    wiringPiSetup();
    // setupEncoder();

    Thermometer temp_sensor;
    temp_sensor.initialize();

    // Adafruit_CharacterOLED lcd(OLED_V2, 8, 9, 15, 0, 2, 3, 4);
    // lcd.begin(16, 2);
    // lcd.print("Wuddup?");
    while(1) {
        float cur_temp = temp_sensor.getTemp();
        std::cout << "Temp = " << cur_temp << " *F" << std::endl;
    };
    return 0;
}

void setupEncoder() {
    pinMode(ENCODER_PINA, INPUT);
    pinMode(ENCODER_PINB, INPUT);
    wiringPiISR(ENCODER_PINA, INT_EDGE_BOTH, encoderISR);
    wiringPiISR(ENCODER_PINB, INT_EDGE_BOTH, encoderISR);
}

void encoderISR() {
    static int old_value = 0;
    static int accumulated = 0;
    /* 
    Lookup table:
    ___|_00_|_01_|_10_|_11
    00 | -- | -1 | +1 | --
    01 | +1 | -- | -- | -1
    10 | -1 | -- | -- | +1
    11 | -- | +1 | -1 | --
    */
    int8_t lookup_table[] = {
        0, 1, -1, 0,
        -1, 0, 0, 1,
        1, 0, 0, -1,
        0, -1, 1, 0
    };
    int new_value = (digitalRead(ENCODER_PINA) << 1) | digitalRead(ENCODER_PINB);
    int8_t direction = lookup_table[4 * old_value + new_value];

    accumulated += direction;
    printf("Sum: %d\n", accumulated);
    old_value = new_value;
}