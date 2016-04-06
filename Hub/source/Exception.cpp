#include "Exception.hpp"

Hub::Exception::Exception(int code, const string& msg) : msg(msg) {
	this->code = code;
}

const char* Hub::Exception::what() const noexcept {
	return msg.c_str();
}

int Hub::Exception::GetErrorCode() {
	return code;
}
