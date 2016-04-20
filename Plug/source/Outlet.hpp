#ifndef OUTLET_HPP
#define OUTLET_HPP

#include <bcm2835.h>

#define OUTLET_1		RPI_GPIO_P1_11
#define OUTLET_2		RPI_GPIO_P1_07
#define OUTLET_3		RPI_GPIO_P1_15

namespace Node
{
	class Outlet
	{
	public:
		Outlet();
		~Outlet();

		void Set(int outlet, bool state);

		bool GetOutletState(int outlet);

	private:
		static const int OUTLET_COUNT = 3;
		//static const RPiGPIOPin pinMap[] = {OUTLET_1, OUTLET_2, OUTLET_3};

		bool outletStates[OUTLET_COUNT];


	};


} //namespace Node

#endif //OUTLET_HPP
