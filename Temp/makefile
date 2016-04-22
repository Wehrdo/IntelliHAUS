CC=g++
LD=g++

CFLAGS=-std=c++14 -Wall

srcdir=source
objsrc=obj
comdir=../common
VPATH=source



all: Temp

Temp: $(objsrc)/Temp.o $(comdir)/$(objsrc)/Communicator.o $(comdir)/$(objsrc)/Packet.o $(comdir)/$(objsrc)/Exception.o
	$(LD) $(CFLAGS) $(comdir)/$(objsrc)/Exception.o $(comdir)/$(objsrc)/Packet.o $(comdir)/$(objsrc)/Communicator.o $(objsrc)/Temp.o -lboost_system -lboost_thread -lpthread -o Temp

$(objsrc)/Temp.o: $(srcdir)/Temp.cpp $(srcdir)/Temp.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Temp.cpp -o $(objsrc)/Temp.o

$(comdir)/$(objsrc)/Communicator.o: $(comdir)/Communicator.cpp $(comdir)/Communicator.hpp
	$(CC) $(CFLAGS) -c $(comdir)/Communicator.cpp -o $(comdir)/$(objsrc)/Communicator.o

$(comdir)/$(objsrc)/Packet.o: $(comdir)/Packet.cpp $(comdir)/Packet.hpp
	$(CC) $(CFLAGS) -c $(comdir)/Packet.cpp -o $(comdir)/$(objsrc)/Packet.o

$(comdir)/$(objsrc)/Exception.o: $(comdir)/Exception.cpp $(comdir)/Exception.hpp
	$(CC) $(CFLAGS) -c $(comdir)/Exception.cpp -o $(comdir)/$(objsrc)/Exception.o

clean:
	rm $(objsrc)/*.o

cleancommon:
	rm $(comdir)/$(objsrc)/*.o
