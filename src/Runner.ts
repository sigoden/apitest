import * as _ from "lodash";
import Loader from "./Loader";
import Clients from "./Clients";
import Cases, { Unit } from "./Cases";
import Session from "./Session";
import Reporter from "./Reporter";
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
          if (idx == this.cases.units.length - 1) {
            units = this.cases.units;
          } else {
            units = this.cases.units.slice(idx + 1);
          }
        }
      } else {
        units = this.cases.units;
      }
    } else {
      units = this.cases.units;
    }
    if (units.length === 0) {
      throw new Error("no cases");
    }
    const reporter = new Reporter(options, this.cases);
    for (const unit of units) {
      await reporter.startUnit(unit);
      if (options.dryRun) continue;
      try {
        const ctx1 = await this.session.getCtx(unit);
        const req = await createReq(unit, ctx1);
        await this.session.saveReq(unit, req);
        let res;
        try {
          res = await this.clients.runUnit(unit, req);
        } catch (err) {
          if (err.paths) throw err;
          throw { paths: unit.paths, anno: "", message: `client error, ${err.message}` };
        }
        await this.session.saveRes(unit, res);
        const ctx2 = await this.session.getCtx(unit);
        _.set(ctx2, "req", _.get(ctx2, unit.paths.concat(["req"])));
        await compareRes(unit, ctx2, res);
        await reporter.endUnit(unit, ctx2, null);
        await this.session.saveCursor(unit);
      } catch (fail) {
        const ctx = await this.session.getCtx(unit);
        await reporter.endUnit(unit, ctx, fail);
        if (!options.ci) break;
      }
    }
    await reporter.summary();
  }
}
