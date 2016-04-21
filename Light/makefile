CC=g++
LD=g++

CFLAGS=-std=c++14 -Wall

srcdir=source
objdir=obj
VPATH=source



all: Light

Light: $(objdir)/Light.o $(objdir)/Communicator.o $(objdir)/Packet.o $(objdir)/Exception.o $(objdir)/LightStrip.o $(objdir)/SPI.o $(objdir)/Color.o
	$(LD) $(CFLAGS) $(objdir)/Color.o $(objdir)/SPI.o $(objdir)/LightStrip.o $(objdir)/Exception.o $(objdir)/Packet.o $(objdir)/Communicator.o $(objdir)/Light.o -lboost_system -lboost_thread -lpthread -lbcm2835 -o Light

$(objdir)/Light.o: $(srcdir)/Light.cpp $(srcdir)/Light.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Light.cpp -o $(objdir)/Light.o

$(objdir)/Communicator.o: $(srcdir)/Communicator.cpp $(srcdir)/Communicator.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Communicator.cpp -o $(objdir)/Communicator.o

$(objdir)/Packet.o: $(srcdir)/Packet.cpp $(srcdir)/Packet.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Packet.cpp -o $(objdir)/Packet.o

$(objdir)/Exception.o: $(srcdir)/Exception.cpp $(srcdir)/Exception.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Exception.cpp -o $(objdir)/Exception.o

$(objdir)/LightStrip.o: $(srcdir)/LightStrip.cpp $(srcdir)/LightStrip.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/LightStrip.cpp -o $(objdir)/LightStrip.o

$(objdir)/SPI.o: $(srcdir)/SPI.c $(srcdir)/SPI.h
	$(CC) $(CFLAGS) -c $(srcdir)/SPI.c -o $(objdir)/SPI.o

$(objdir)/Color.o: $(srcdir)/Color.cpp $(srcdir)/Color.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Color.cpp -o $(objdir)/Color.o

clean:
	rm $(objdir)/*.o
