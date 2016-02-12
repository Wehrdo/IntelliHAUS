#include "Hub.hpp"

int main() {
	string str;
	HTTP httpConnection("www.google.com");

	std::cout << httpConnection.Get("/");

	return 0;
}
