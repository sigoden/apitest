import { Client } from ".";
import { Unit } from "../Cases";
import Session from "../Session";

export default class HttpClient implements Client {
  private name: string;
  private options: any;
  constructor(name: string, options: any) {
    this.name = name;
    this.options = options;
  }
  validate(unit: Unit) {
  }

  async run(session: Session, uint: Unit) {
  }
}
