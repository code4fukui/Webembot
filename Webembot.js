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
        e515 read writeWithoutResponse
        e516 read writeWithoutResponse
        e517 read writeWithoutResponse
        e518 read writeWithoutResponse
        e51a read writeWithoutResponse // right RED
        e51b read writeWithoutResponse

        // buzzer
        e521 read writeWithoutResponse

        e531 notify read
        e532 notify read
        e533 read write
        e5e1 read
        e5e2 read
        e5e3 read
        e5e4 read
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
        await service.getCharacteristic(uuid("e515")),
        await service.getCharacteristic(uuid("e516")),
        await service.getCharacteristic(uuid("e517")),
        await service.getCharacteristic(uuid("e518")),
        await service.getCharacteristic(uuid("e51a")),
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
    return embot;
  }
  constructor(device, server, service, plus, f503i) {
    this.device = device;
    this.server = server;
    this.service = service;
    this.plus = plus;
    this.f503i = f503i;
  }
  async writeBLE(char, val) {
    const buf = new Uint8Array(1);
    buf[0] = parseInt(val);
    await char.writeValueWithoutResponse(buf.buffer);
  }
  async led(id, val) { // id: 1 or 2, val: true or false
    if (id < 1 || id > this.leds.length) {
      console.log("led " + id + " is not supported");
      return;
    }
    const target = this.leds[id - 1];
    await this.writeBLE(target, val ? 1 : 2);
    /*
    if (this.f503i) {
      await this.writeBLE(target, val ? 1 : 0);
    } else {
      await this.writeBLE(target, val ? 1 : 2);
    }
    */
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
}
