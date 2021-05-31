import Cases, { Unit, UnitFail } from "./Cases";
import { RunOptions } from "./Runner";
import * as chalk from "chalk";

export default class Reporter {
  private options: RunOptions;
  private cases: Cases;
  private currentPaths: string[] = [];
  constructor(options: RunOptions, cases: Cases) {
    this.options = options;
    this.cases = cases;
  }
  public async startUnit(unit: Unit) {
    const idx = unit.paths.findIndex((path, idx) => this.currentPaths[idx] !== path);
    this.reportTitle(unit, idx);

    this.currentPaths = unit.paths;
  }
  public async endUnit(unit: Unit, ctx: any, fail: UnitFail) {
    if (!fail) {
      process.stdout.write(chalk.green(" ✔\n"));
    } else {
      process.stdout.write(chalk.red(" ✘\n"));
      this.reportFail(unit, fail);
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
        content += i > 0 ? ` (${key})\n` : "\n";
        process.stdout.write(content);
      } else {
        if (i < unit.paths.length - 1) {
          content += "\n";
        }
        process.stdout.write(chalk.bold(content));
      }
    }
  }
  private reportFail(unit: Unit, fail: UnitFail) {
    const content = `${"  ".repeat(unit.paths.length - 1)}${fail.paths.join(".") + (fail.anno ? "@" + fail.anno : "")}: ${fail.message}\n\n`;
    process.stdout.write(chalk.red(content));
  }
}
