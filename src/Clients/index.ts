import { Unit } from "../Cases";
import { JsonaAnnotation } from "../types";
import { toPosString } from "../Loader";

import Session from "../Session";
import EchoClient from "./EchoClient";
import HttpClient from "./HttpClient";

export abstract class Client {
  constructor(options: any) {}
  abstract validate(unit: Unit);
  abstract get name(): string;
  abstract run(unit: Unit, req: any): Promise<any>; 
}

export default class Clients {
  public clients: {[k: string]: Client} = {};
  public addClient(anno: JsonaAnnotation) {
    const { name, kind, options } = anno.value;
    if (!name || !kind) {
      throw new Error(`[main@client] should have name and kind${toPosString(anno.position)}`);
    }
    if (kind === "echo") {
      this.clients[name] = new EchoClient(options);
    } else if (kind === "http") {
      this.clients[name] = new HttpClient(options);
    } else {
      throw new Error(`[main@client] kind '${kind}' is unsupported${toPosString(anno.position)}`);
    }
  }
  public ensureDefault() {
    let existEcho = false;
    let existDefault = false;
    for (const name in this.clients) {
      const client = this.clients[name];
      if (name === "default") {
        existDefault = true;
      }
      if (client.name === "echo") {
        existEcho = true;
      }
    }
    if (!existEcho && !this.clients["echo"]) {
      this.clients["echo"] = new EchoClient({});
    }
    if (!existDefault) {
      this.clients["default"] = new HttpClient({});
    }
  }
  public validateUnit(unit: Unit) {
    const client = this.clients[unit.client.name];
    if (!client) {
      throw new Error(`[${unit.paths.join(".")}] client '${unit.client.name}' is miss`);
    }
    client.validate(unit);
  }
  public async runUnit(unit: Unit, req: any): Promise<any> {
    const client = this.clients[unit.client.name];
    return client.run(unit, req);
  }
}

export interface UnitClient {
  name: string;
  options: any;
}
