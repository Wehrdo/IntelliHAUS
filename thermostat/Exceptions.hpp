#include <stdexcept>
#include <string>

/*
 * For exceptions that are "dangeorus", in the sense that the system will not be working
 */
class DangerousException : public std::runtime_error {
public:
    DangerousException(std::string s) : std::runtime_error(s) {}
};
