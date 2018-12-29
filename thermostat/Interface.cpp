#include <stdarg.h>  // For va_start, etc.

#include "Interface.hpp"

Interface::Interface(Adafruit_CharacterOLED screen)
    : screen(screen) {
    int width = 16;
    // screen.begin(width, 2);
    screen.setCursor(0, 0);
    screen.print("Sup!");
    // screen.setCursor(0, 1);
}

void Interface::notifyCurTemp(float temp) {
    screen.setCursor(0, 0);
    // delayMicroseconds(2000);
    screen.print(string_format("Temp: %.1f", temp));
    screen.write(0xD2);
    // degree symbol
}

void Interface::notifyWheel(int dir) {
    screen.setCursor(0, 1);
    screen.print(string_format("Wheel: %+d", dir));
}

/*
 * Shamelessly stolen from https://stackoverflow.com/a/8098080/314013
 */
std::string Interface::string_format(const std::string fmt, ...) {
    int size = ((int)fmt.size()) * 2 + 50;   // Use a rubric appropriate for your code
    std::string str;
    va_list ap;
    while (1) {     // Maximum two passes on a POSIX system...
        str.resize(size);
        va_start(ap, fmt);
        int n = vsnprintf((char *)str.data(), size, fmt.c_str(), ap);
        va_end(ap);
        if (n > -1 && n < size) {  // Everything worked
            str.resize(n);
            return str;
        }
        if (n > -1)  // Needed size returned
            size = n + 1;   // For null char
        else
            size *= 2;      // Guess at a larger size (OS specific)
    }
    return str;
}