import * as _ from "lodash";
import Loader from "./Loader";
import Clients from "./Clients";
import Cases, { Unit } from "./Cases";
import Session from "./Session";
import Reporter, { RunUnitError } from "./Reporter";
import createReq from "./createReq";
import compareRes from "./compareRes";

export interface RunOptions {
  ci?: boolean;
  reset?: boolean;
  dryRun?: boolean;
  only?: string;
}

export default class Runner {
  private clients: Clients;
  private cases: Cases;
  private session: Session;

  public static async create(target: string, env: string) {
    const runner = new Runner();
    const loader = new Loader();
    const { clients, cases, mainFile, jslibs } = await loader.load(target, env);
    const session = await Session.create(mainFile, cases.units.map(v => v.id), jslibs);
    runner.session = session;
    runner.cases = cases;
    runner.clients = clients;
    return runner;
  }

  public async run(options: RunOptions) {
    let units: Unit[];
    if (options.only) {
      units = this.cases.units.filter(v => v.id.startsWith(options.only));
    } else if (!options.reset) {
      if (this.session.cursor) {
        const idx = this.cases.units.findIndex(v => v.id === this.session.cursor);
        if (idx > -1) {
          if (idx < this.cases.units.length - 1) {
            units = this.cases.units.slice(idx + 1);
          }
        }
      }
    }
    if (!units) {
      units = this.cases.units;
    }
    if (units.length === 0) {
      throw new Error("no cases");
    }
    let anyFail = false;
    const reporter = new Reporter(options, this.cases);
    for (const unit of units) {
      await reporter.startUnit(unit);
      if (options.dryRun) continue;
      let timeMs = 0;
      try {
        const ctx1 = await this.session.getCtx(unit);
        const req = await createReq(unit, ctx1);
        await this.session.saveReq(unit, req);
        let res;
        try {
          const timeStart = process.hrtime();
          res = await this.clients.runUnit(unit, req);
          const timeEnd = process.hrtime(timeStart);
          timeMs = timeEnd[0] * 1000 + Math.floor(timeEnd[1] / 1000000);
        } catch (err) {
          if (err.name === "RunUnitError") throw err;
          throw new RunUnitError(unit.paths, "", `client error, ${err.message}`); 
        }
        await this.session.saveRes(unit, res);
        const ctx2 = await this.session.getCtx(unit);
        _.set(ctx2.state, "req", _.get(ctx2.state, unit.paths.concat(["req"])));
        await compareRes(unit, ctx2, res);
        await reporter.endUnit({ unit, state: ctx2.state, timeMs });
        if (!options.only && !options.ci) await this.session.saveCursor(unit);
      } catch (fail) {
        anyFail = true;
        const ctx = await this.session.getCtx(unit);
        await reporter.endUnit({ unit, state: ctx.state, err: fail, timeMs });
        if (!options.ci) break;
      }
    }
    if (options.ci) {
      await this.session.clearCursor();
      await reporter.summary();
    }
    return anyFail ? 1 : 0;
  }
}
