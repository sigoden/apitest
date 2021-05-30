import { Client } from ".";
import Session from "../Session";
import { Unit } from "../Cases";

export default class EchoClient implements Client {
  constructor(_name: string, _options: any) {}
  validate(_unit: Unit) {}
  async run(_session: Session, _uint: Unit) {}
}
