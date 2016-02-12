#ifndef HTTP_HPP
#define HTTP_HPP

#include <boost/asio.hpp>
#include <array>
#include <string>
#include <iostream>
#include <memory>
#include <sstream>

using namespace std;

class HTTP
{
public:
	HTTP(string hostName);
	~HTTP();

	string Get(string path);

private:
	string hostName;
	boost::asio::io_service ioService;
	unique_ptr<boost::asio::ip::tcp::socket> tcpSocket;
};

#endif //HTTP_HPP
