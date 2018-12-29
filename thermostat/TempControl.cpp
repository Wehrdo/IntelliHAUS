#include "TempControl.hpp"
#include <iostream>

TempControl::TempControl(float slack)
    : maxDeviance(slack) {
    
}

void TempControl::setMode(Mode new_mode) {
    curMode = new_mode;
    switch (new_mode) {
        case OFF:
            state = INACTIVE;
            break;
        case HEATING:
            state = HEATING_INACTIVE;
            break;
        case COOLING:
            state = COOLING_INACTIVE;
            break;
    }
}

void TempControl::setFanOn(bool on) {
    fanOn = on;
}

void TempControl::setTarget(float target) {
    setpoint = target;
}

void TempControl::notifyCurTemp(float current) {
    curTemp = current;
}

TempControl::Control TempControl::getControl() {
    // Determine new state
    switch (state) {
        case INACTIVE:
            break;
        case HEATING_INACTIVE:
            if (curTemp < setpoint - maxDeviance) {
                // Out of range, need to begin heating
                state = HEATING_ACTIVE;
            }
            break;
        case HEATING_ACTIVE:
            if (curTemp >= setpoint) {
                // have reached target
                state = HEATING_INACTIVE;
            }
            break;
        case COOLING_INACTIVE:
            if (curTemp > setpoint + maxDeviance) {
                // Out of range, begin cooling
                state = COOLING_ACTIVE;
            }
            break;
        case COOLING_ACTIVE:
            if (curTemp <= setpoint) {
                // Have reached desired setpoint, can stop
                state = COOLING_INACTIVE;
            }
            break;
    }

    // Gets output control ignoring fan setting
    auto getBaseControl = [&]() {
        switch (state) {
            case INACTIVE:
                return NONE;
            case HEATING_INACTIVE:
                return NONE;
            case HEATING_ACTIVE:
                if (curMode == HEATING) {
                    return HEAT;
                }
                else {
                    return NONE;
                }
            case COOLING_INACTIVE:
                return NONE;
            case COOLING_ACTIVE:
                if (curMode == COOLING) {
                    return COOL;
                }
                else {
                    return NONE;
                }
            default:
                std::cout << "Unhandled state " << state << std::endl;
                return NONE;
        }
    };

    // Modifies control with current fan setting
    auto getControlWithFan = [&](Control ctrl) {
        if (ctrl == NONE && fanOn) {
            return RUN_FAN;
        }
        else {
            return ctrl;
        }
    };

    return getControlWithFan(getBaseControl());
}
