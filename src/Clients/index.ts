import { Unit } from "../Cases";
import { JsonaAnnotation } from "../types";
import { toPosString } from "../utils";

import Session from "../Session";
import EchoClient from "./EchoClient";
import HttpClient from "./HttpClient";

export abstract class Client {
  constructor(name: string, options: any) {}
  abstract validate(unit: Unit);
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
      this.clients[name] = new EchoClient(name, options);
    } else if (kind === "http") {
      this.clients[name] = new HttpClient(name, options);
    } else {
      throw new Error(`[main@client] kind '${kind}' is unsupported${toPosString(anno.position)}`);
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
