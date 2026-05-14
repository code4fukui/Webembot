# Webembot

Webembotは、embot、embot plus、およびF503iデバイス用のドライバーAPIです。

## デモ
[DEMO](https://code4fukui.github.io/Webembot/)

## 機能
- LED、ブザー、サーボモーターの制御
- 明るさとキー入力の読み取り
- embot、embot plus、F503iデバイスのサポート

## 使い方
本ライブラリは、Bluetooth経由でembot、embot plus、F503iデバイスを制御するために使用できます。デバイスの各コンポーネントを操作するためのメソッド群を提供します。

## API
- `led(idx, n, brightness = 255)`: LEDを制御します。`idx`はLEDのインデックス（1〜3）、`n`はオン/オフを指定する真偽値、`brightness`は明るさのレベル（0〜255、F503iのみ）です。
- `buzzer(n)`: ブザーを鳴らします。`n`は音の周波数です。
- `servo(idx, n)`: サーボモーターを制御します。`idx`はサーボのインデックス（1〜3）、`n`は角度（0〜180）です。
- `getBrightness()`: 明るさのレベルを返します（F503iの場合は0〜600）。
- `getKey()`: キーパッドで最後に押されたキーを返します。
- `setKeyEventListener(listener)`: キーが押された、または離されたときに呼び出されるコールバック関数を設定します。

## ライセンス
MIT License — 詳細は [LICENSE](LICENSE) を参照してください。
