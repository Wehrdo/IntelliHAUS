#ifndef EXCEPTION_HPP
#define EXCEPTION_HPP

#include <exception>
#include <string>
#include "ErrorCode.hpp"

using namespace std;

namespace Hub {

class Exception : public exception {
public:
	Exception(int code, const string& msg);

	virtual const char* what() const noexcept;

	int GetErrorCode();

private:
	string msg;
	int code;
};
}


#endif //EXCEPTION_HPP
