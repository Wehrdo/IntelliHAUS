CC=g++
LD=g++

CFLAGS=-std=c++14 -Wall

srcdir=source
objdir=obj
comdir=../common
VPATH=source



all: Motion

Motion: $(objdir)/Motion.o $(comdir)/$(objdir)/Communicator.o $(comdir)/$(objdir)/Packet.o $(comdir)/$(objdir)/Exception.o $(objdir)/Sensor.o
	$(LD) $(CFLAGS) $(objdir)/Sensor.o $(comdir)/$(objdir)/Exception.o $(comdir)/$(objdir)/Packet.o $(comdir)/$(objdir)/Communicator.o $(objdir)/Motion.o -lboost_system -lboost_thread -lpthread -lbcm2835 -o Motion

$(objdir)/Motion.o: $(srcdir)/Motion.cpp $(srcdir)/Motion.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Motion.cpp -o $(objdir)/Motion.o

$(comdir)/$(objdir)/Communicator.o: $(comdir)/Communicator.cpp $(comdir)/Communicator.hpp
	$(CC) $(CFLAGS) -c $(comdir)/Communicator.cpp -o $(comdir)/$(objdir)/Communicator.o

$(comdir)/$(objdir)/Packet.o: $(comdir)/Packet.cpp $(comdir)/Packet.hpp
	$(CC) $(CFLAGS) -c $(comdir)/Packet.cpp -o $(comdir)/$(objdir)/Packet.o

$(comdir)/$(objdir)/Exception.o: $(comdir)/Exception.cpp $(comdir)/Exception.hpp
	$(CC) $(CFLAGS) -c $(comdir)/Exception.cpp -o $(comdir)/$(objdir)/Exception.o

$(objdir)/Sensor.o: $(srcdir)/Sensor.cpp $(srcdir)/Sensor.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Sensor.cpp -o $(objdir)/Sensor.o

clean:
	rm $(objdir)/*.o

cleancommon:
	rm $(comdir)/$(objdir)/*.o
