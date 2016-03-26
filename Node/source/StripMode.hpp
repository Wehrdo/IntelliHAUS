#ifndef STRIPMODE_HPP
#define STRIPMODE_HPP

#include <memory>
#include "LightStrip.hpp"

class StripMode
{
public:
	StripMode(int size) {
		strip.reset(new LightStrip(size));
		started = false;
	}
	~StripMode() {}

	virtual void GetRawColors(unsigned char colors[]) {
		strip->DumpColors(colors);
	}
protected:
	std::unique_ptr<LightStrip> strip;
	bool started;
};

#endif
