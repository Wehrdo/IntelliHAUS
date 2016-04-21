#ifndef STRIPMODES_HPP
#define STRIPMODES_HPP

#include "StripMode.hpp"
#include <memory>
#include <iostream>

class StripModeSolid : public StripMode
{
public:
	StripModeSolid(int size, Color const& c);
	~StripModeSolid() {};

	void SetColor(Color const& c);
	Color GetColor();

	void Display();
};

class StripModeDissipate : public StripMode
{
public:
	StripModeDissipate(int size, int centerSize, double speed);
	~StripModeDissipate();

	void PushColor(Color const& c);
	void PushColors(Color const& up, Color const& down);
protected:
	double GetMoveDistance(double dt, double speed);

	Color lastUp, lastDown;
	int centerSize;
	double speed, distanceRemainder;
};

#endif
