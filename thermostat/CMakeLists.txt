cmake_minimum_required(VERSION 2.6)
project(thermostat)

# set(SOURCES
#     thermostat.cpp
#     Adafruit_CharacterOLED.cpp
#     Thermometer.cpp
#     EncoderWheel.cpp
#     Interface.cpp
#     TempControl.cpp)
file(GLOB SOURCES "./*.cpp" "./*.hpp")

add_executable(thermostat ${SOURCES})

target_link_libraries(thermostat wiringPi)
