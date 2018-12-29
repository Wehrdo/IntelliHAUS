#pragma once

class TempControl {
public:
    TempControl(float slack);
    void setTarget(float target);
    void notifyCurTemp(float current);

    enum Mode {
        OFF,
        HEATING,
        COOLING
    };

    void setMode(Mode new_mode);
    void setFanOn(bool on);

    enum Control {
        NONE,
        HEAT,
        COOL,
        RUN_FAN
    };

    Control getControl();
private:
    // Maximum deviance from setpoint allowed before action is taken
    float maxDeviance;
    // target setpoint
    float setpoint = 22;
    // Mode of our thermostat
    Mode curMode = OFF;
    // Current temperature
    float curTemp;
    bool fanOn = false;

    // Temperature is controlled by a state machine
    enum State {
        INACTIVE,
        HEATING_INACTIVE,
        HEATING_ACTIVE,
        COOLING_INACTIVE,
        COOLING_ACTIVE
    } state = INACTIVE;
};
