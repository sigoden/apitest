import Cases, { Unit, UnitFail } from "./Cases";
import { RunOptions } from "./Runner";
import * as chalk from "chalk";
import { VmContext } from "./Session";

export default class Reporter {
  private options: RunOptions;
  private cases: Cases;
  private currentPaths: string[] = [];
  private fails: [Unit, UnitFail][] = [];
  constructor(options: RunOptions, cases: Cases) {
    this.options = options;
    this.cases = cases;
  }
  public async startUnit(unit: Unit) {
    const idx = unit.paths.findIndex((path, idx) => this.currentPaths[idx] !== path);
    this.reportTitle(unit, idx);

    this.currentPaths = unit.paths;
  }
  public async endUnit(unit: Unit, ctx: VmContext, fail: UnitFail) {
    if (!fail) {
      process.stdout.write(chalk.green(" ✔\n"));
    } else {
      process.stdout.write(chalk.red(" ✘\n"));
      if (!this.options.ci) {
        this.reportFail(fail, (unit.paths.length - 1) * 2);
      } else {
        this.fails.push([unit, fail]);
      }
    }
  }

  public async summary() {
    if (!this.options.ci) return;
    process.stdout.write("\n");
    for (const [i, [unit, fail]] of this.fails.entries()) {
      const key = unit.paths.join(".");
      const describe = this.cases.describes[key];
      const prefix = `${i + 1}. `;
      process.stdout.write(`${prefix}${describe}(${key})\n`);
      this.reportFail(fail, prefix.length);
    }
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
  private reportFail(fail: UnitFail, indent: number) {
    const content = `${" ".repeat(indent)}${fail.paths.join(".") + (fail.anno ? "@" + fail.anno : "")}: ${fail.message}\n\n`;
    process.stdout.write(chalk.red(content));
  }
}
