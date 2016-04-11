CC=g++
LD=g++

CFLAGS=-std=c++14 -Wall

srcdir=source
VPATH=source



all: Temp

Temp: Temp.o Communicator.o Packet.o Exception.o
	$(LD) $(CFLAGS) Exception.o Packet.o Communicator.o Temp.o -lboost_system -lboost_thread -lpthread -o Temp

Temp.o: $(srcdir)/Temp.cpp $(srcdir)/Temp.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Temp.cpp

Communicator.o: $(srcdir)/Communicator.cpp $(srcdir)/Communicator.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Communicator.cpp

Packet.o: $(srcdir)/Packet.cpp $(srcdir)/Packet.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Packet.cpp

Exception.o: $(srcdir)/Exception.cpp $(srcdir)/Exception.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Exception.cpp
