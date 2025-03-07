export class Webembot {
  static async create() {
    const uuid = (s) => `f7fc${s}-7a0b-4b89-a675-a79137223e2c`;
    const ruuid = (uuid) => uuid.substring(4, 8);
    const opt = {
      optionalServices: [uuid("e510")],
      filters: [
        { namePrefix: "EMBOT_" },
        { namePrefix: "EMBOTPLUS_" },
        { namePrefix: "F503i_" },
      ],
    };
    const device = await navigator.bluetooth.requestDevice(opt);
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(uuid("e510"));
    // check all
    const chs = await service.getCharacteristics();
    for (const ch of chs) {
      const show = (p) => {
        const names = [
          "authenticatedSignedWrites",
          "broadcast",
          "indicate",
          "notify",
          "read",
          "reliableWrite",
          "writableAuxiliaries",
          "write",
          "writeWithoutResponse",
        ];
        const ss = [];
        for (const name of names) {
          if (p[name]) ss.push(name);
        }
        return ss.join(" ");
      };
      console.log(ruuid(ch.uuid), show(ch.properties));
      /*
        // led
        e515 read writeWithoutResponse // green (left)
        e516 read writeWithoutResponse // yellow (center)
        e517 read writeWithoutResponse // green with brightness
        e518 read writeWithoutResponse // yellow with brightness
        e51a read writeWithoutResponse // red (right)
        e51b read writeWithoutResponse // red with brightness

        e521 read writeWithoutResponse // buzzer

        e531 notify read // key status change -> 2byte // big endian #*9876543210 の順、12bit

        e532 notify read // light sonsor

        e533 read write

        e5e1 read
        e5e2 read
        e5e3 read
        e5e4 read // 2byte
      */
    }
    console.log();
    
    const plus = device.name.startsWith("EMBOTPLUS_");
    const f503i = device.name.startsWith("F503i_");
    const embot = new Webembot(device, server, service, plus, f503i);
    if (!f503i) {
      embot.leds = [
        await service.getCharacteristic(uuid("e515")),
        await service.getCharacteristic(uuid("e516")),
      ];
    } else {
      embot.leds = [
        /*
        await service.getCharacteristic(uuid("e515")),
        await service.getCharacteristic(uuid("e516")),
        await service.getCharacteristic(uuid("e51a")),
        */
        await service.getCharacteristic(uuid("e517")),
        await service.getCharacteristic(uuid("e518")),
        await service.getCharacteristic(uuid("e51b")),
      ];
    }
    if (!f503i) {
      embot.servos = [
        await service.getCharacteristic(uuid("e511")),
        await service.getCharacteristic(uuid("e512")),
      ];
      if (plus) {
        embot.servos.push(await service.getCharacteristic(uuid("e513")));
      }
    }
    embot.buzzer1 = await service.getCharacteristic(uuid("e521"));
    //embot.other1 = await service.getCharacteristic(uuid("e525"));
    if (f503i) {
      const uuidread = ["e515", "e516", "e533", "e5e1", "e5e2", "e5e3", "e5e4"];
      embot.others = [];
      for (const i of uuidread) {
        const ch = await service.getCharacteristic(uuid(i));
        embot.others.push(ch);
      }
      {
        const ch = await service.getCharacteristic(uuid("e531")); // ten key
        ch.addEventListener('characteristicvaluechanged', async e => {
          const data = new Uint8Array(e.target.value.buffer);
          const n = (data[1] << 8) | data[0]; // data.length == 2
          // LSMから 0-9*#
          //console.log('recv', i, n.toString(2)); // data.length, data);
          embot.setKeyState(n);
        });
        ch.startNotifications();
      }
      {
        const ch = await service.getCharacteristic(uuid("e532")); // light sensor
        ch.addEventListener('characteristicvaluechanged', async e => {
          const data = new Uint8Array(e.target.value.buffer);
          const n = (data[1] << 8) | data[0]; // data.length == 2
          console.log(n, data.length);
        });
        ch.startNotifications();
        embot.lightsensor = ch;
      }
    }
    return embot;
  }
  constructor(device, server, service, plus, f503i) {
    this.device = device;
    this.server = server;
    this.service = service;
    this.plus = plus;
    this.f503i = f503i;
    // for F530i
    this.keylisteners = [];
    this.keystate = (1 << 13) - 1; // 12bit
    this.keybuflen = 16;
    this.keybuf = [];
  }
  async writeBLE(char, val) {
    const buf = new Uint8Array(1);
    buf[0] = parseInt(val);
    await char.writeValueWithoutResponse(buf.buffer);
  }
  async led(id, val, brightness = 255) { // id: 1-3, val: true or false, brightness is only for F503i
    if (id < 1 || id > this.leds.length) {
      console.log("led " + id + " is not supported");
      return;
    }
    const target = this.leds[id - 1];
    if (!this.f503i) {
      await this.writeBLE(target, val ? 1 : 2);
    } else {
      await this.writeBLE(target, val ? brightness : 0);
    }
  }
  async servo(id, val) { // id: 1-3, val: 0?
    if (this.f503i) {
      console.log("servo is not supported");
      return;
    }
    if (id < 1 || id > 3) throw new Error("id must be 1 to 3");
    if (!this.plus && id == 3) {
      console.log("servo 3 is only embot+");
      return;
    }
    const target = this.servos[id - 1];
    await this.writeBLE(target, val);
  }
  async buzzer(val = 61) {
    const target = this.buzzer1;
    await this.writeBLE(target, val);
  }
  async readAll() {
    for (let i = 0; i < this.others.length; i++) {
      const ch = this.others[i];
      const data = await ch.readValue();
      const n = new Uint8Array(data.buffer);
      console.log(i, n.length, n);
    }
  }
  async getBrightness() { // F503i 0-600
    if (!this.f503i) {
      await this.writeBLE(this.others[2], 1);
      const ch = this.others[0];
      const data = await ch.readValue();
      const n = new Uint8Array(data.buffer);
      const res = (n[1] << 8) | n[0];
      return res;
    } else {
      const data = await this.lightsensor.readValue();
      const n = new Uint8Array(data.buffer);
      const res = (n[1] << 8) | n[0];
      return res;
    }
  }
  setKeyState(n) {
    const bk = this.keystate;
    this.keystate = n;
    const keys = "0123456789*#";
    const down = bk & ~n; // 1 -> 0
    const up = ~bk & n; // 0 -> 1
    for (let i = 0; i < 12; i++) {
      const c = keys[i];
      if (down & (1 << i)) {
        console.log("key down: " + c);
        //if let f = funckeydown { f(c) }
        if (this.keybuf.length == this.keybuflen) {
          this.keybuf.shift();
        }
        this.keybuf.push(c);
      } else if (up & (1 << i)) {
        console.log("key up: " + c);
        //if let f = funckeyup { f(c) }
      }
    }
    for (const l of this.keylisteners) {
      l(n);
    }
  }
  addKeyEventListener(listener) {
    this.keylisteners.push(listener);
  }
  getKey() {
    return this.keybuf.pop();
  }
}
