CC=g++
LD=g++

CFLAGS=-std=c++0x -Wall

srcdir=source
VPATH=source

all: Hub

Hub:  HTTP.o Hub.o
		g++ $(CFLAGS) HTTP.o Hub.o -lboost_system -lboost_thread -lpthread -o Hub

HTTP.o: $(srcdir)/HTTP.cpp $(srcdir)/HTTP.hpp
	g++ $(CFLAGS) -c $(srcdir)/HTTP.cpp

Hub.o: $(srcdir)/Hub.cpp $(srcdir)/Hub.hpp
	g++ $(CFLAGS) -c $(srcdir)/Hub.cpp


clean:
	rm *o
