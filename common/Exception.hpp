#ifndef EXCEPTION_HPP
#define EXCEPTION_HPP

#include <exception>
#include <string>

using namespace std;

namespace Node {

class Exception : public exception {
public:
	//constructor
	Exception(const string& msg);

	//returns the error message
	virtual const char* what() const noexcept;

private:
	string msg;
};
}


#endif //EXCEPTION_HPP
