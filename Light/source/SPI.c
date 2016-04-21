#include "SPI.h"

void SPI_Init() {
	bcm2835_init();

	bcm2835_spi_begin();

	bcm2835_spi_setChipSelectPolarity(BCM2835_SPI_CS0, 0);
	bcm2835_spi_setChipSelectPolarity(BCM2835_SPI_CS1, 0);

	bcm2835_spi_setClockDivider(BCM2835_SPI_CLOCK_DIVIDER_64);

	bcm2835_spi_setDataMode(BCM2835_SPI_MODE0);
	bcm2835_spi_chipSelect(BCM2835_SPI_CS0);
}

void SPI_Send(unsigned char *buffer, int size) {
	bcm2835_spi_transfern((char*)&buffer[0], size);
}

void SPI_End() {
	bcm2835_spi_end();
}
