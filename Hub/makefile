CC=g++-4.9
LD=g++-4.9

CFLAGS=-std=c++14 -Wall

srcdir=source
VPATH=source

jsondir=source/json

all: Hub

Hub:  jsoncpp.o HTTP.o Server.o Hub.o
		$(CC) $(CFLAGS) jsoncpp.o HTTP.o Server.o Hub.o -lboost_system -lboost_thread -lpthread -o Hub

jsoncpp.o: $(jsondir)/jsoncpp.cpp $(jsondir)/json/json.h
	$(CC) $(CFLAGS) -c $(jsondir)/jsoncpp.cpp

HTTP.o: $(srcdir)/HTTP.cpp $(srcdir)/HTTP.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/HTTP.cpp

Server.o: $(srcdir)/Server.cpp $(srcdir)/Server.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Server.cpp

Hub.o: $(srcdir)/Hub.cpp $(srcdir)/Hub.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Hub.cpp


clean:
	rm *o
