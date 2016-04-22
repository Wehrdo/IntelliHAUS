CC=g++-4.9
LD=g++-4.9

CFLAGS=-std=c++14 -Wall

srcdir=source
VPATH=source

jsondir=source/json

all: Hub

Hub:  jsoncpp.o HTTP.o Server.o Communicator.o Packet.o Node.o NodeServer.o Exception.o Hub.o
		$(CC) $(CFLAGS) jsoncpp.o HTTP.o Server.o Communicator.o Packet.o Node.o NodeServer.o Exception.o Hub.o -lboost_system -lboost_thread -lpthread -o Hub

jsoncpp.o: $(jsondir)/jsoncpp.cpp $(jsondir)/json/json.h
	$(CC) $(CFLAGS) -c $(jsondir)/jsoncpp.cpp

HTTP.o: $(srcdir)/HTTP.cpp $(srcdir)/HTTP.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/HTTP.cpp

Server.o: $(srcdir)/Server.cpp $(srcdir)/Server.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Server.cpp

Communicator.o: $(srcdir)/Communicator.cpp $(srcdir)/Communicator.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Communicator.cpp

Packet.o: $(srcdir)/Packet.cpp $(srcdir)/Packet.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Packet.cpp

Node.o: $(srcdir)/Node.cpp $(srcdir)/Node.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Node.cpp

NodeServer.o: $(srcdir)/NodeServer.cpp $(srcdir)/NodeServer.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/NodeServer.cpp

Exception.o: $(srcdir)/Exception.cpp $(srcdir)/Exception.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Exception.cpp

Hub.o: $(srcdir)/Hub.cpp $(srcdir)/Hub.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Hub.cpp


clean:
	rm *o
