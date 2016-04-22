#include "LightStrip.hpp"

LightStrip::LightStrip(int count) {
	SPI_Init();

	if (count < 1)
		count = 1;

	for (int i = 0; i < count; i++)
		colors.push_back(Color());

	this->size = count;
}

LightStrip::~LightStrip() {
	SPI_End();
}

void LightStrip::Set(int id, Color c) {
	if (id < 0 || id >= size)
		return;

	colors[id] = c;
}

void LightStrip::SetAll(Color c) {
	for (int i = 0; i < size; i++)
		colors[i] = c;
}

void LightStrip::ShiftUp(int amount) {

}

void LightStrip::ShiftUp(int start, int amount) {
	auto itr = colors.begin();
	std::copy_backward(itr + start, itr + size - amount, itr + size);
}

void LightStrip::ShiftDown(int amount) {

}

void LightStrip::ShiftDown(int start, int amount) {
	std::vector<Color> tempColor(start - amount);

	auto itr = colors.begin();
	auto tItr = tempColor.begin();

	std::copy(itr + amount, itr + start, tItr);
	std::copy(tItr, tItr + tempColor.size(), itr);
}

Color LightStrip::GetColor(int id) {
	if (id < 0 || id >= size)
		return Color(0, 0, 0);

	return colors[id];
}

int LightStrip::GetSize() {
	return size;
}

void LightStrip::DumpColors(unsigned char colorArray[]) {
	for (int i = 0; i < size; i++) {
		Color color = colors[i];

		colorArray[3 * i] = color.GetRed();
		colorArray[3 * i + 1] = color.GetGreen();
		colorArray[3 * i + 2] = color.GetBlue();
	}
}

void LightStrip::Display() {
	int endFrameCount = std::ceil(size / 64.f);
	int frameCount = size + 1 + endFrameCount;
	int byteCount = 4*frameCount;

	unsigned char *data = new unsigned char[byteCount];

	//Initialize the start frame
	for(int i = 0; i < 4; i++) {
		data[i] = 0x00;
	}

	//Write the pixel frames
	for(int i = 0; i < size; i++) {
		int index = 4 + 4*i;
		Color c = colors[i];

		data[index] = 0xFF;
		data[index + 1] = c.GetBlue();
		data[index + 2] = c.GetGreen();
		data[index + 3] = c.GetRed();
	}

	//Initialize the end frames
	for(int i = 0; i < endFrameCount; i++) {
		int index = 4*(size + 1) + 4*i;

		data[index] = 0xFF;
		data[index + 1] = 0x00;
		data[index + 2] = 0x00;
		data[index + 3] = 0x00;
	}

	SPI_Send(data, byteCount);

	delete[] data;
}
