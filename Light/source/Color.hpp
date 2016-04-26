#ifndef COLOR_HPP
#define COLOR_HPP

#include <cmath>
#include <algorithm>
#include <string>

typedef unsigned char byte;

class Color {
public:
	//Default constructor
	Color();

	//Constructor from packet RRGGBB integer
	Color(unsigned long c);

	//Constructor from individual r, g, b values
	Color(int r, int g, int b);

	//Color operator=(Color)
	//operator= for color class
	Color operator=(Color c);

	//bool operator!=(Color rhs)

	bool operator!=(Color rhs);
	bool operator==(Color rhs);

	std::string ToString();

	void Scale(float scale);
	void Filter(Color c, float strength);

	byte GetRed();
	byte GetGreen();
	byte GetBlue();

	int GetLargestComponent(byte *component);

	void SetRed(byte red);
	void SetGreen(byte green);
	void SetBlue(byte blue);

	float GetHue();
	float GetSaturation();
	float GetLightness();

	void SetLightness(float lightness);

	void Print();

	unsigned long GetWin32Color();

	static Color ColorWheel(float pos);
	static Color HSL(float hue, float saturation, float lightness);

private:
	int r, g, b;
};

#endif
