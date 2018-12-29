#include "EncoderWheel.hpp"

#include <wiringPi.h>
#include <iostream>

// static member initialization
int EncoderWheel::pinA = -1;
int EncoderWheel::pinB = -1;
EncoderWheel::CB_FUNC EncoderWheel::callback = EncoderWheel::CB_FUNC();

void EncoderWheel::setCallback(CB_FUNC cb) {
    callback = cb;
}

void EncoderWheel::init(int pin_a, int pin_b) {
    pinA = pin_a;
    pinB = pin_b;

    pinMode(pin_a, INPUT);
    pinMode(pin_b, INPUT);

    wiringPiISR(pin_a, INT_EDGE_BOTH, encoderISR);
    wiringPiISR(pin_b, INT_EDGE_BOTH, encoderISR);
}

void EncoderWheel::encoderISR() {
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
    // std::cout << "pinA: " << digitalRead(pinA) << std::endl;
    // std::cout << "pinB: " << digitalRead(pinB) << std::endl;
    int new_value = (digitalRead(pinA) << 1) | digitalRead(pinB);
    int8_t direction = lookup_table[4 * old_value + new_value];

    callback(direction);

    accumulated += direction;
    // printf("Sum: %d\n", accumulated);
    old_value = new_value;
}