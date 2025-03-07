# Webembot

Webembot is a driver API for embot, embot plus and F503i.

- [DEMO](https://code4fukui.github.io/Webembot/)

## API

- led(idx, n, brightness = 255) // idx:1-3, n:boolean, brightness:0-255
- buzzer(n) // 51=C?
- servo(idx, n) // idx:1-3, n:0-180
- getBrightness() // 0-600
- getKey() // "0"-"9","*","#" from keybuffer
- setKeyEventListener(listener) // keystate

## reference

- [embot（エムボット） | 遊ぶほど、プログラミングが楽しくなる。](https://www.embot.jp/)
- [embotをブラウザから操作したい #JavaScript - Qiita](https://qiita.com/hta393939/items/acaba88899be443637ac)
- [こどもプログラミング用ロボット「embot」をJavaScriptから制御するライブラリ「Webembot」](https://fukuno.jig.jp/4571)
- [ケータイ型プログラミング体験付録つき！『小学８年生 はじめてのプログラミング号』 | 『小学８年生』](https://sho.jp/sho8/80348)

## related

- [wakwak-koba/F503i: 小学館 小学8年生 2025年スペシャル4月号に付属の F503i を ESP32 で操るライブラリ](https://github.com/wakwak-koba/F503i)
- [code4fukui/Macembot: F503i and embot driver in Swift (beta)](https://github.com/code4fukui/Macembot)
