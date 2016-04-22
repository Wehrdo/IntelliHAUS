#include "Exception.hpp"

Hub::Exception::Exception() {
	code = 0;
}

Hub::Exception::Exception(int code, const string& msg) : msg(msg) {
	this->code = code;
}

const char* Hub::Exception::what() const noexcept {
	return msg.c_str();
}

int Hub::Exception::GetErrorCode() const {
	return code;
}

Hub::Exception::operator bool() {
	return code != Error_Code::NO_ERROR;
}
