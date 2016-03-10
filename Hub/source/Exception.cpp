#include "Exception.hpp"

Hub::Exception::Exception(const string& msg) : msg(msg) {

}

const char* Hub::Exception::what() const noexcept {
	return msg.c_str();
}
