import { Unit } from "./Cases";
import { RunOptions } from "./Runner";
import { CompareFail } from "./compareRes";

export default class Reporter {
  public async prepare(options: RunOptions) {

  }
  public async startUnit(unit: Unit) {

  }
  public async endUnit(unit: Unit, fail: CompareFail, req: any, res: any) {

  }
}
