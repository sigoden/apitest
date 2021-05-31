import { Client } from ".";
import { Unit } from "../Cases";

export default class HttpClient implements Client {
  private name: string;
  private options: any;
  public constructor(name: string, options: any) {
    this.name = name;
    this.options = options;
  }
  public validate(unit: Unit) {
  }

  async run(uint: Unit, req: any) {
  }
}
