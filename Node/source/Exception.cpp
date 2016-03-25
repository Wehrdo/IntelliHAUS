#include "Exception.hpp"

Node::Exception::Exception(const string& msg) : msg(msg) {

}

const char* Node::Exception::what() const noexcept {
	return msg.c_str();
}
