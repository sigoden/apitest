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
  private reporter: Reporter;

  public static async create(target: string, env: string) {
    const runner = new Runner();
    const loader = new Loader();
    const { clients, cases, mainFile } = await loader.load(target, env);
    runner.cases = cases;
    runner.clients = clients;
    const session = await Session.create(mainFile, cases.units.map(v => v.id));
    const reporter = new Reporter();
    runner.session = session;
    runner.reporter = reporter;
    return runner;
  }

  public async run(options: RunOptions) {
    let units: Unit[];
    if (options.only) {
      units = this.cases.units.filter(v => v.id.startsWith(options.only));
    } else if (!options.reset) {
      if (this.session.last) {
        const idx = this.cases.units.findIndex(v => v.id === this.session.last);
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
    }
    if (units.length === 0) {
      throw new Error("no cases");
    }
    await this.reporter.prepare(options);
    for (const unit of units) {
      await this.reporter.startUnit(unit);
      if (!options.dryRun) {
        const ctx = await this.session.getCtx(unit);
        const req = await createReq(unit, ctx);
        await this.session.saveReq(unit, req);
        const res = await this.clients.runUnit(unit, req);
        const fail = await compareRes(unit, res);
        await this.session.saveRes(unit, res);
        await this.reporter.endUnit(unit, fail, req, res);
      }
    }
  }
}
