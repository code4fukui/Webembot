# Webembot

> 日本語のREADMEはこちらです: [README.ja.md](README.ja.md)

Webembot is a driver API for embot, embot plus and F503i devices.

## Demo
[DEMO](https://code4fukui.github.io/Webembot/)

## Features
- Control LED, buzzer, and servo motors
- Read brightness and key input
- Supports embot, embot plus, and F503i devices

## Usage
The library can be used to control the embot, embot plus, and F503i devices over Bluetooth. It provides a set of methods to interact with the device's components.

## API
- `led(idx, n, brightness = 255)`: Controls the LED. `idx` is the LED index (1-3), `n` is a boolean to turn it on/off, and `brightness` is the brightness level (0-255, only for F503i).
- `buzzer(n)`: Plays a tone on the buzzer. `n` is the tone frequency.
- `servo(idx, n)`: Controls the servo motor. `idx` is the servo index (1-3), `n` is the angle (0-180).
- `getBrightness()`: Returns the brightness level (0-600 for F503i).
- `getKey()`: Returns the last key pressed from the keypad.
- `setKeyEventListener(listener)`: Sets a callback function to be called when a key is pressed or released.

## License
MIT License — see [LICENSE](LICENSE).