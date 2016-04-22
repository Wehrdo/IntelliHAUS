CC=g++
LD=g++

CFLAGS=-std=c++14 -Wall

srcdir=source
objdir=obj
comdir=../common
VPATH=source



all: Plug

Plug: $(objdir)/Plug.o $(comdir)/$(objdir)/Communicator.o $(comdir)/$(objdir)/Packet.o $(comdir)/$(objdir)/Exception.o $(objdir)/Outlet.o
	$(LD) $(CFLAGS) $(objdir)/Outlet.o $(comdir)/$(objdir)/Exception.o $(comdir)/$(objdir)/Packet.o $(comdir)/$(objdir)/Communicator.o $(objdir)/Plug.o -lboost_system -lboost_thread -lpthread -lbcm2835 -o Plug

$(objdir)/Plug.o: $(srcdir)/Plug.cpp $(srcdir)/Plug.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Plug.cpp -o $(objdir)/Plug.o

$(comdir)/$(objdir)/Communicator.o: $(comdir)/Communicator.cpp $(comdir)/Communicator.hpp
	$(CC) $(CFLAGS) -c $(comdir)/Communicator.cpp -o $(comdir)/$(objdir)/Communicator.o

$(comdir)/$(objdir)/Packet.o: $(comdir)/Packet.cpp $(comdir)/Packet.hpp
	$(CC) $(CFLAGS) -c $(comdir)/Packet.cpp -o $(comdir)/$(objdir)/Packet.o

$(comdir)/$(objdir)/Exception.o: $(comdir)/Exception.cpp $(comdir)/Exception.hpp
	$(CC) $(CFLAGS) -c $(comdir)/Exception.cpp -o $(comdir)/$(objdir)/Exception.o

$(objdir)/Outlet.o: $(srcdir)/Outlet.cpp $(srcdir)/Outlet.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Outlet.cpp -o $(objdir)/Outlet.o

clean:
	rm $(objdir)/*.o
