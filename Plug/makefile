CC=g++
LD=g++

CFLAGS=-std=c++14 -Wall

srcdir=source
VPATH=source



all: Node

Node: Node.o Communicator.o Packet.o Exception.o Outlet.o
	$(LD) $(CFLAGS) Outlet.o Exception.o Packet.o Communicator.o Node.o -lboost_system -lboost_thread -lpthread -lbcm2835 -o Node

Node.o: $(srcdir)/Node.cpp $(srcdir)/Node.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Node.cpp

Communicator.o: $(srcdir)/Communicator.cpp $(srcdir)/Communicator.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Communicator.cpp

Packet.o: $(srcdir)/Packet.cpp $(srcdir)/Packet.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Packet.cpp

Exception.o: $(srcdir)/Exception.cpp $(srcdir)/Exception.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Exception.cpp

Outlet.o: $(srcdir)/Outlet.cpp $(srcdir)/Outlet.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Outlet.cpp
