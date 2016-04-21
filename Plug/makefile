CC=g++
LD=g++

CFLAGS=-std=c++14 -Wall

srcdir=source
objdir=obj
VPATH=source



all: Plug

Plug: $(objdir)/Plug.o $(objdir)/Communicator.o $(objdir)/Packet.o $(objdir)/Exception.o $(objdir)/Outlet.o
	$(LD) $(CFLAGS) $(objdir)/Outlet.o $(objdir)/Exception.o $(objdir)/Packet.o $(objdir)/Communicator.o $(objdir)/Plug.o -lboost_system -lboost_thread -lpthread -lbcm2835 -o Plug

$(objdir)/Plug.o: $(srcdir)/Plug.cpp $(srcdir)/Plug.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Plug.cpp -o $(objdir)/Plug.o

$(objdir)/Communicator.o: $(srcdir)/Communicator.cpp $(srcdir)/Communicator.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Communicator.cpp -o $(objdir)/Communicator.o

$(objdir)/Packet.o: $(srcdir)/Packet.cpp $(srcdir)/Packet.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Packet.cpp -o $(objdir)/Packet.o

$(objdir)/Exception.o: $(srcdir)/Exception.cpp $(srcdir)/Exception.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Exception.cpp -o $(objdir)/Exception.o

$(objdir)/Outlet.o: $(srcdir)/Outlet.cpp $(srcdir)/Outlet.hpp
	$(CC) $(CFLAGS) -c $(srcdir)/Outlet.cpp -o $(objdir)/Outlet.o

clean:
	rm $(objdir)/*.o
