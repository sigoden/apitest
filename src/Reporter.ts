import * as chalk from "chalk";
import * as _ from "lodash";
import Cases, { Case } from "./Cases";
import { RunOptions } from "./Runner";

export interface EndCaseArgs {
  testcase: Case,
  state: any,
  err?: RunCaseError,
  timeMs?: number;
}

export class RunCaseError extends Error {
  public paths: string[];
  public anno: string;
  public subErrors: RunCaseError[];
  constructor(paths: string[], anno: string, message: string, subErrors: RunCaseError[] = []) {
    super(message);
    Error.captureStackTrace(this, RunCaseError);
    this.paths = paths;
    this.anno = anno;
    this.subErrors = subErrors;
    this.name = "RunCaseError";
  }
}

export default class Reporter {
  private options: RunOptions;
  private cases: Cases;
  private currentPaths: string[] = [];
  private fails: EndCaseArgs[] = [];
  constructor(options: RunOptions, cases: Cases) {
    this.options = options;
    this.cases = cases;
  }

  public async startCase(testcase: Case) {
    const idx = testcase.paths.findIndex((path, idx) => this.currentPaths[idx] !== path);
    this.reportTitle(testcase, idx);

    this.currentPaths = testcase.paths;
  }
  public async endCase(args: EndCaseArgs) {
    let timeStr = "";
    if (args.timeMs) {
      timeStr = " (" + (args.timeMs / 1000).toFixed(3) + ")";
    }
    const dump = _.get(args.state, "run.dump");
    if (!args.err) {
      process.stdout.write(chalk.green(`${timeStr} ✔\n`));
      if (dump) {
        this.reportData(args.testcase, args.state);
      }
    } else {
      process.stdout.write(chalk.red(`${timeStr} ✘\n`));
      if (this.options.ci) {
        if (dump) {
          this.reportData(args.testcase, args.state);
        }
        this.fails.push(args);
      } else {
        this.reportError(args.err, (args.testcase.paths.length - 1) * 2);
        const count = _.get(args.state, "$run.count");
        if (!count || dump)  {
          process.stdout.write("\n");
          this.reportData(args.testcase, args.state);
        }
      }
    }
  }

  public async errRunCase(testcase: Case, err: RunCaseError) {
    const idx = testcase.paths.findIndex((path, idx) => this.currentPaths[idx] !== path);
    this.reportTitle(testcase, idx);
    process.stdout.write("\n");
    this.currentPaths = testcase.paths;
    this.reportError(err, (testcase.paths.length - 1) * 2);
  }

  public async skipCase(testcase: Case) {
    const idx = testcase.paths.findIndex((path, idx) => this.currentPaths[idx] !== path);
    this.reportTitle(testcase, idx);
    process.stdout.write(chalk.bold(" ⌾\n"));
    this.currentPaths = testcase.paths;
  }
  public async summary() {
    if (!this.fails.length) return;
    process.stdout.write("\n");
    for (const [i, args] of this.fails.entries()) {
      const key = args.testcase.paths.join(".");
      const describe = this.cases.describes[key];
      const prefix = `${i + 1}. `;
      process.stdout.write(`${prefix}${describe}(${key})\n`);
      this.reportError(args.err, prefix.length);
      process.stdout.write("\n");
    }
  }

  private reportTitle(testcase: Case, idx: number) {
    if (idx === -1) {
      idx = testcase.paths.length - 1;
    }
    for (let i = idx; i < testcase.paths.length; i++) {
      const paths = testcase.paths.slice(0, i+1);
      const key = paths.join(".");
      const describe = this.cases.describes[key];
      let content = `${"  ".repeat(i)}${describe}`;
      if (this.options.dryRun) {
        content += i > 0 ? ` (${key})\n` : "\n";
        process.stdout.write(content);
      } else {
        if (i < testcase.paths.length - 1) {
          content += "\n";
        }
        process.stdout.write(chalk.bold(content));
      }
    }
  }
  private reportError(err: RunCaseError, indent: number) {
    let content = `${" ".repeat(indent)}${err.paths.join(".") + (err.anno ? "@" + err.anno : "")}: ${err.message}\n`;
    if(err.subErrors) {
      for (const subErr of err.subErrors) {
        content += `${" ".repeat(indent + 2)}${subErr.paths.join(".") + (subErr.anno ? "@" + subErr.anno : "")}: ${subErr.message}\n`;
      }
    }
    process.stdout.write(chalk.red(content));
  }

  private reportData(unit: Case, state: any) {
    const data = _.pick(_.get(state, unit.paths, {}), ["req", "res", "run"]);
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
