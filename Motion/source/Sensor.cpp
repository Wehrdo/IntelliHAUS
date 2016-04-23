#include "Sensor.hpp"
#include <iostream>


Node::Sensor::Sensor() {
	std::cout << "Initializing outlet..." << std::endl;

	if(!bcm2835_init()) {
		std::cout << "ERROR: bcm2835 library failed to initialize!" << std::endl;
	}
	else
		std::cout << "Sensor initialized" << std::endl;

	bcm2835_gpio_fsel(SENSOR_PIN, BCM2835_GPIO_FSEL_INPT);

	lastState = false;
	//bcm2835_gpio_hen(SENSOR_PIN);
}

Node::Sensor::~Sensor() {
	bcm2835_close();
}

bool Node::Sensor::Check() {
	bool state = bcm2835_gpio_lev(SENSOR_PIN);

	if(state != lastState) {
		lastState = state;

		return state;
	}

	return false;
}
