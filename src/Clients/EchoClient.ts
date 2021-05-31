import { Client } from ".";
import { Unit } from "../Cases";

export default class EchoClient implements Client {
  public constructor(_options: any) {}
  public get name() {
    return "echo";
  }
  public validate(_unit: Unit) {}
  public async run(_unit: Unit, req: any) {
    return req;
  }
}
