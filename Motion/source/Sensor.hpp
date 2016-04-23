#ifndef OUTLET_HPP
#define OUTLET_HPP

#include <bcm2835.h>

#define SENSOR_PIN	RPI_V2_GPIO_P1_11

namespace Node
{
	class Sensor
	{
	public:
		Sensor();
		~Sensor();

		bool Check();
	private:
		bool lastState;
	};
} //namespace Node

#endif //OUTLET_HPP
