CC=g++
LD=g++

CFLAGS=-std=c++14 -Wall

srcdir=source
objsrc=obj
VPATH=source



all: Temp

Temp: $(objsrc)/Temp.o $(objsrc)/Communicator.o $(objsrc)/Packet.o $(objsrc)/Exception.o
	$(LD) $(CFLAGS) $(objsrc)/Exception.o $(objsrc)/Packet.o $(objsrc)/Communicator.o $(objsrc)/Temp.o -lboost_system -lboost_thread -lpthread -o Temp

$(objsrc)/Temp.o: $(srcdir)/Temp.cpp $(srcdir)/Temp.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Temp.cpp -o $(objsrc)/Temp.o

$(objsrc)/Communicator.o: $(srcdir)/Communicator.cpp $(srcdir)/Communicator.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Communicator.cpp -o $(objsrc)/Communicator.o

$(objsrc)/Packet.o: $(srcdir)/Packet.cpp $(srcdir)/Packet.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Packet.cpp -o $(objsrc)/Packet.o

$(objsrc)/Exception.o: $(srcdir)/Exception.cpp $(srcdir)/Exception.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Exception.cpp -o $(objsrc)/Exception.o
