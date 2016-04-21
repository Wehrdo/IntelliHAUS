#define LED_COUNT		240
#define WELL_COUNT		40

#include <vector>
#include <iostream>
#include <stdint.h>
#include <bcm2835.h>
#include <cmath>
#include "LightStrip.h"
#include "ColorWell.h"

uint64_t Millis() {
	return bcm2835_st_read() / 1000;
}

int main() {
	std::vector<ColorWell> wells;
	LightStrip strip(LED_COUNT);

	srand(bcm2835_st_read());

	int wellCount = WELL_COUNT;

	for(int i = 0; i < wellCount; i++) {
		wells.push_back(ColorWell(LED_COUNT));
	}

	uint64_t lastTime = Millis();

	while(1) {
		uint64_t thisTime = Millis();
		float dt = (thisTime - lastTime) / 1000.f;

		lastTime = thisTime;

		for(int i = 0; i < LED_COUNT; i++) {
			float r = 0, g = 0, b = 0;
			for(int j = 0; j < wellCount; j++) {
				float distance = std::abs(i - wells[j].GetPos()) - wells[j].GetRadius();
				Color c = wells[j].GetColor();

				if(distance < 1)
					distance = 1;

				float strength = wells[j].GetMass() / (distance * distance * distance);

				if(strength > 1)
					strength = 1;

				r += strength * c.GetRed();
				g += strength * c.GetGreen();
				b += strength * c.GetBlue();
			}
			if(r > 255)
				r = 255;

			if(g > 255)
				g = 255;

			if(b > 255)
				b = 255;

			//strip.Set(i, Color(r, g, b));
			strip.Set(i, Color(128, 0, 0));
		}

		strip.Display();

		for(int i = 0; i < wellCount; i++) {
			wells[i].Update(dt);

			float pos = wells[i].GetPos();

			if(pos < 0 || pos >= LED_COUNT) {
				wells[i] = ColorWell(LED_COUNT);
			}
		}
	}

	return 0;
}
