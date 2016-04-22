#include "Outlet.hpp"
#include <iostream>


Node::Outlet::Outlet() {
	static const RPiGPIOPin pinMap[] = {OUTLET_1, OUTLET_2, OUTLET_3};
	
	std::cout << "Initializing outlet..." << std::endl;

	if(!bcm2835_init()) {
		std::cout << "ERROR: bcm2835 library failed to initialize!" << std::endl;
	}
	else
		std::cout << "Outlet initialized" << std::endl;

	for(int i = 0; i < OUTLET_COUNT; i++) {
		outletStates[i] = false;
		bcm2835_gpio_fsel(pinMap[i], BCM2835_GPIO_FSEL_OUTP);
		bcm2835_gpio_write(pinMap[i], LOW);
	}
}

Node::Outlet::~Outlet() {
	bcm2835_close();
}

void Node::Outlet::Set(int outlet, bool state) {
	if(outlet < 0 || outlet >= OUTLET_COUNT)
		return;
	
	static const RPiGPIOPin pinMap[] = {OUTLET_1, OUTLET_2, OUTLET_3};
	
	bcm2835_gpio_write(pinMap[outlet], state ? HIGH : LOW);

	outletStates[outlet] = state;
}

bool Node::Outlet::GetOutletState(int outlet) {
	if(outlet < 0 || outlet >= OUTLET_COUNT)
		return false;

		return outletStates[outlet];
}
