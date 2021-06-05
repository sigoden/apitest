import * as _ from "lodash";
import Loader from "./Loader";
import Clients from "./Clients";
import Cases, { Case, Group, Unit } from "./Cases";
import Session from "./Session";
import Reporter, { RunCaseError } from "./Reporter";
import createReq from "./createReq";
import createRun, { CaseRun } from "./createRun";
import compareRes from "./compareRes";
import { sleep } from "./utils";

export interface RunOptions {
  ci?: boolean;
  reset?: boolean;
  dryRun?: boolean;
  only?: string;
}

export default class Runner {
  private options: RunOptions;
  private clients: Clients;
  private cases: Cases;
  private session: Session;
  private reporter: Reporter;

  public static async create(target: string, env: string) {
    const runner = new Runner();
    const loader = new Loader();
    const { clients, cases, mainFile, jslibs } = await loader.load(target, env);
    const session = await Session.create(mainFile, cases.caseIds, jslibs);
    runner.session = session;
    runner.cases = cases;
    runner.clients = clients;
    return runner;
  }

  public async run(options: RunOptions) {
    this.options = options;
    if (this.options.reset) {
      this.session.clearCache();
    }

    let anyFail = false;
    this.reporter = new Reporter(this.options, this.cases);

    const testcases = this.selectCases();

    for (const testcase of testcases) {
      const success = await this.runCase(testcase);
      if (!success) {
        anyFail = true;
        if (!this.options.ci) break;
      }
    }
    if (options.ci) {
      await this.session.clearCursor();
      await this.reporter.summary();
    }
    return anyFail ? 1 : 0;
  }

  private async runCase(testcase: Case, first = true) {
    try {
      if (first) {
        await this.session.saveValue(testcase, "$run", {}, false);
      }
      const ctx = await this.session.getCtx(testcase);
      const run: CaseRun = createRun(testcase, ctx);
      if (run) await this.session.saveValue(testcase, "run", run);
      if (!this.options.dryRun && run) {
        if (run.skip) {
          await this.reporter.skipCase(testcase);
          return true ;
        }
        if (run.delay) {
          await sleep(run.delay);
        }
        if (run.loop) {
          let index = _.get(ctx.state, ["$run", "index"], 0);
          await this.session.saveValue(testcase, "$run", { index, item: run.loop.items[index] }, false);
          const success = await this.doRunCase(testcase);
          if (!success) {
            if (testcase.group) await this.saveCursor(testcase.prev);
            return success;
          } else {
            index++;
            if (index >= run.loop.items.length) {
              return true;
            }
            await this.session.saveValue(testcase, "$run", { index, item: run.loop.items[index] }, false);
            await sleep(run.loop.delay);
            return this.runCase(testcase, false);
          }
        }
        if (run.retry) {
          let count = _.get(ctx.state, ["$run", "count"], 1);
          if (count === 1) {
            await this.session.saveValue(testcase, "$run", { count }, false);
          } 
          const success = await this.doRunCase(testcase);
          if(!success) {
            if (run.retry.stop) {
              if (testcase.group) await this.saveCursor(testcase.prev);
              return false;
            }
            count++;
            await this.session.saveValue(testcase, "$run", { count }, false);
            await sleep(run.retry.delay);
            return this.runCase(testcase, false);
          }
          return success;
        }
      }
      return this.doRunCase(testcase);

    } catch (err) {
      await this.reporter.errRunCase(testcase, err);
      return false;
    }
  }

  private async doRunCase(testcase: Case) {
    return testcase.group 
      ? this.runGroup(testcase as Group) 
      : this.runUnit(testcase as Unit);
  }

  private async runGroup(group: Group) {
    let success: boolean;
    for (const testcase of group.cases) {
      success = await this.runCase(testcase);
      if (!success) {
        if (!this.options.ci) break;
      }
    }
    return success;
  }

  private async runUnit(unit: Unit) {
    await this.reporter.startCase(unit);
    if (this.options.dryRun) return true;
    let timeMs = 0;
    try {
      const ctx1 = await this.session.getCtx(unit);
      const req = await createReq(unit, ctx1);
      await this.session.saveValue(unit, "req", req);
      let res;
      try {
        const timeStart = process.hrtime();
        res = await this.clients.runUnit(unit, req);
        const timeEnd = process.hrtime(timeStart);
        timeMs = timeEnd[0] * 1000 + Math.floor(timeEnd[1] / 1000000);
      } catch (err) {
        if (err.name === "RunCaseError") throw err;
        throw new RunCaseError(unit.paths, "", `client error, ${err.message}`); 
      }
      await this.session.saveValue(unit, "res", res);
      const ctx2 = await this.session.getCtx(unit);
      await compareRes(unit, ctx2, res);
      await this.reporter.endCase({ testcase: unit, state: ctx2.state, timeMs });
      await this.saveCursor(unit.id);
      return true;
    } catch (err) {
      const ctx = await this.session.getCtx(unit);
      await this.reporter.endCase({ testcase: unit, state: ctx.state, err, timeMs });
      return false;
    }
  }

  private async saveCursor(cursor: string) {
    if (!this.options.only && !this.options.ci) {
      await this.session.saveCursor(cursor);
    }
  }

  private selectCases() {
    let testcases: Case[];
    if (this.options.only) {
      const paths = this.options.only.split(".");
      if (paths.length === 1) {
        testcases = this.cases.cases.filter(v => v.paths[0] === paths[0]);
      } else {
        testcases = this.cases.cases.filter(v => v.id === this.options.only);
      }
    } else if (!this.options.reset) {
      if (this.session.cursor) {
        const idx = this.cases.cases.findIndex(v => v.id === this.session.cursor);
        if (idx > -1) {
          if (idx < this.cases.cases.length - 1) {
            testcases = this.cases.cases.slice(idx + 1);
          }
        }
      }
    }

    if (!testcases) {
      testcases = this.cases.cases;
    }
    if (testcases.length === 0) {
      throw new Error("no cases");
    }
    return testcases;
  }
}
