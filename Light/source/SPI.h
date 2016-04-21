#include <bcm2835.h>

void SPI_Init();

void SPI_Send(unsigned char *buffer, int size);

void SPI_End();
