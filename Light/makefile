CC=g++
LD=g++

CFLAGS=-std=c++14 -Wall

srcdir=source
objdir=obj
comdir=../common
VPATH=source



all: Light

Light: $(objdir)/Light.o $(comdir)/$(objdir)/Communicator.o $(comdir)/$(objdir)/Packet.o $(comdir)/$(objdir)/Exception.o $(objdir)/LightStrip.o $(objdir)/SPI.o $(objdir)/Color.o
	$(LD) $(CFLAGS) $(objdir)/Color.o $(objdir)/SPI.o $(objdir)/LightStrip.o $(comdir)/$(objdir)/Exception.o $(comdir)/$(objdir)/Packet.o $(comdir)/$(objdir)/Communicator.o $(objdir)/Light.o -lboost_system -lboost_thread -lpthread -lbcm2835 -o Light

$(objdir)/Light.o: $(srcdir)/Light.cpp $(srcdir)/Light.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Light.cpp -o $(objdir)/Light.o

$(comdir)/$(objdir)/Communicator.o: $(comdir)/Communicator.cpp $(comdir)/Communicator.hpp
	$(CC) $(CFLAGS) -c $(comdir)/Communicator.cpp -o $(comdir)/$(objdir)/Communicator.o

$(comdir)/$(objdir)/Packet.o: $(comdir)/Packet.cpp $(comdir)/Packet.hpp
	$(CC) $(CFLAGS) -c $(comdir)/Packet.cpp -o $(comdir)/$(objdir)/Packet.o

$(comdir)/$(objdir)/Exception.o: $(comdir)/Exception.cpp $(comdir)/Exception.hpp
	$(CC) $(CFLAGS) -c $(comdir)/Exception.cpp -o $(comdir)/$(objdir)/Exception.o

$(objdir)/LightStrip.o: $(srcdir)/LightStrip.cpp $(srcdir)/LightStrip.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/LightStrip.cpp -o $(objdir)/LightStrip.o

$(objdir)/SPI.o: $(srcdir)/SPI.c $(srcdir)/SPI.h
	$(CC) $(CFLAGS) -c $(srcdir)/SPI.c -o $(objdir)/SPI.o

$(objdir)/Color.o: $(srcdir)/Color.cpp $(srcdir)/Color.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Color.cpp -o $(objdir)/Color.o

clean:
	rm $(objdir)/*.o
