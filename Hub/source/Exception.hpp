#ifndef EXCEPTION_HPP
#define EXCEPTION_HPP

#include <exception>
#include <string>
#include "ErrorCode.hpp"

/*
	*Exception.hpp
	*This file implements the class Hub::Exception
	*This extends std::exception and privides an additional
	*	integral error code
	*
*/

using namespace std;

namespace Hub {

class Exception : public exception {
public:
	//Default constructor
	Exception();

	//Constructor
	//Param code : integral error code
	//Param msg : string error message
	Exception(int code, const string& msg);

	//what()
	//returns error message string
	virtual const char* what() const noexcept;

	//GetErrorCode()
	//returns integral error code
	int GetErrorCode() const;

	//operator bool()
	//evaluates the exception as a boolean value
	//returns false if error code == 0, true otherwise
	operator bool();

private:
	string msg;
	int code;
};
}


#endif //EXCEPTION_HPP
