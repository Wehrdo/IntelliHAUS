#include <functional>

class EncoderWheel {
public:
    typedef std::function<void(int)> CB_FUNC;

    static void setCallback(CB_FUNC cb);
    static void init(int pin_a, int pin_b);
    static void encoderISR();
private:
    static int pinA;
    static int pinB;
    static CB_FUNC callback;
};
