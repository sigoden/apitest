import { Client } from ".";
import { Unit } from "../Cases";

export default class EchoClient implements Client {
  public constructor(_name: string, _options: any) {}
  public get kind() {
    return "echo";
  }
  public validate(_unit: Unit) {}
  public async run(_unit: Unit, req: any) {
    return req;
  }
}
