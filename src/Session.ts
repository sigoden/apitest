import * as os from "os";
import * as path from "path";
import * as fs from "fs/promises";
import * as crypto from "crypto";
import * as _ from "lodash";
import { Unit } from "./Cases";

export default class Session {
  private cacheFile: string;
  private cache: Cache;
  private unitIds: string[];

  public constructor(cacheFile: string, unitIds: string[], cache: Cache) {
    this.cacheFile = cacheFile;
    this.unitIds = unitIds;
    this.cache = cache;
  }

  public static async create(mainFile: string, unitIds: string[]) {
    const cacheFileName = "apitest" + md5(mainFile) + ".json";
    const cacheFile = path.resolve(os.tmpdir(), cacheFileName);
    const cache = await loadCache(cacheFile);
    const session = new Session(cacheFile, unitIds, cache);
    return session;
  }

  public get last(): string {
    return this.cache.last;
  }

  public async getCtx(unit: Unit) {
    const idx = this.unitIds.findIndex(v => v === unit.id);
    const ctx = {};
    if (idx > -1) {
      for (let i = 0; i <= idx; i++) {
        const unitId = this.unitIds[i];
        const req = _.get(this.cache.tests, unitId + ".req", {});
        const res = _.get(this.cache.tests, unitId + ".res", {});
        _.set(ctx, unitId, _.clone({ req, res }));
      }
    }
    for (let i = 1; i < unit.paths.length; i++) {
      _.set(ctx, unit.paths[i], _.get(ctx, unit.paths.slice(0, i + 1)));
    }
    _.set(ctx, "req", _.get(ctx, unit.paths.concat(["req"])));
    return ctx;
  }

  public async saveReq(unit: Unit, req: any) {
    let test = this.cache.tests[unit.id];
    if (!test) {
      test = this.cache.tests[unit.id] = { req, res: {} };
    } else {
      test.req = req;
      test.res = {};
    }
    await saveCache(this.cacheFile, this.cache);
  }
  public async saveRes(unit: Unit, res: any) {
    const test = this.cache.tests[unit.id];
    test.res = res;
    await saveCache(this.cacheFile, this.cache);
  }
}


export interface Cache {
  last: string;
  tests: {
    [k: string]: {
      req?: any;
      res?: any;
    }
  }
}

async function loadCache(cacheFile: string): Promise<Cache> {
  try {
    const content = await fs.readFile(cacheFile, "utf8");
    const cache = JSON.parse(content);
    return cache;
  } catch (err) {
    return { last: "", tests: {} };
  }
}

async function saveCache(cacheFile: string, cache: Cache) {
  const content = JSON.stringify(cache);
  await fs.writeFile(cacheFile, content);
}

function md5(target: string) {
  const md5 = crypto.createHash("md5");
  return md5.update(target).digest("hex");
}
