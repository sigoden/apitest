import Cases, { Unit, UnitFail } from "./Cases";
import { RunOptions } from "./Runner";

export default class Reporter {
  private options: RunOptions;
  private cases: Cases;
  private currentPaths: string[];
  constructor(options: RunOptions, cases: Cases) {
    this.options = options;
  }
  public async startUnit(unit: Unit) {
    let diff = false;
    for (const [i, path] of unit.paths.entries()) {
      if (!diff && this.currentPaths[i] === path) {
        continue;
      }
      diff = true;
      this.reportTitle(unit, i);
    }

    this.currentPaths = unit.paths;
  }
  public async endUnit(unit: Unit, ctx: any, fail: UnitFail) {
    if (!fail) {
      process.stdout.write(" ✔\n");
    } else {
      process.stdout.write(" ✘\n");
    }
  }
  public async summary() {

  }
  private reportTitle(unit: Unit, idx: number) {
    for (let i = idx; i < unit.paths.length; i++) {
      const paths = unit.paths.slice(0, i+1);
      const key = paths.join(".");
      const describe = this.cases.describes[key];
      let content = `${"  ".repeat(i)}${describe}`;
      if (this.options.dryRun) {
        content += `(${key})\n`;
      } else {
        if (i < unit.paths.length - 1) {
          content += "\n";
        }
      }
      process.stdout.write(content);
    }
  }
}
