import * as chalk from "chalk";
import * as _ from "lodash";
import Cases, { Unit } from "./Cases";
import { RunOptions } from "./Runner";

export interface EndUnitArgs {
  unit: Unit,
  state: any,
  fail?: RunUnitError,
  timeMs?: number;
}

export class RunUnitError extends Error {
  public paths: string[];
  public anno: string;
  constructor(paths: string[], anno: string, message: string) {
    super(message);
    Error.captureStackTrace(this, RunUnitError);
    this.paths = paths;
    this.anno = anno;
    this.name = "RunUnitError";
  }
}

export default class Reporter {
  private options: RunOptions;
  private cases: Cases;
  private currentPaths: string[] = [];
  private fails: EndUnitArgs[] = [];
  constructor(options: RunOptions, cases: Cases) {
    this.options = options;
    this.cases = cases;
  }
  public async startUnit(unit: Unit) {
    const idx = unit.paths.findIndex((path, idx) => this.currentPaths[idx] !== path);
    this.reportTitle(unit, idx);

    this.currentPaths = unit.paths;
  }
  public async endUnit(args: EndUnitArgs) {
    let timeStr = "";
    if (args.timeMs) {
      timeStr = " (" + (args.timeMs / 1000).toFixed(3) + ")";
    }
    if (!args.fail) {
      process.stdout.write(chalk.green(`${timeStr} ✔\n`));
    } else {
      process.stdout.write(chalk.red(`${timeStr} ✘\n`));
      if (!this.options.ci) {
        this.reportFail(args.fail, (args.unit.paths.length - 1) * 2);
        this.reportData(args.unit, args.state);
      } else {
        this.fails.push(args);
      }
    }
  }

  public async summary() {
    if (!this.options.ci) return;
    process.stdout.write("\n");
    for (const [i, args] of this.fails.entries()) {
      const key = args.unit.paths.join(".");
      const describe = this.cases.describes[key];
      const prefix = `${i + 1}. `;
      process.stdout.write(`${prefix}${describe}(${key})\n`);
      this.reportFail(args.fail, prefix.length);
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
  private reportFail(fail: RunUnitError, indent: number) {
    const content = `${" ".repeat(indent)}${fail.paths.join(".") + (fail.anno ? "@" + fail.anno : "")}: ${fail.message}\n\n`;
    process.stdout.write(chalk.red(content));
  }

  private reportData(unit: Unit, state: any) {
    const data = _.get(state, unit.paths, {});
    const content = JSON.stringify(data, null, 2);
    const indent = (unit.paths.length - 1) * 2;
    let lines = content.split("\n");
    if (lines.length > 200) {
      const ellipse = lines[100];
      const spaces = ellipse.length - _.trimStart(ellipse).length;
      lines = [...lines.slice(0, 99), `${" ".repeat(spaces)}...`, ...lines.slice(100)];
    }
    const output = lines.map(v => " ".repeat(indent) + v).join("\n");
    process.stdout.write(chalk.gray(output + "\n"));
  }
}
