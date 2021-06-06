import * as os from "os";
import * as path from "path";
import * as fs from "fs/promises";
import * as crypto from "crypto";
import * as _ from "lodash";
import { Case, Unit } from "./Cases";

export const EMPTY_CACHE = { cursor: "", tests: {} };

export default class Session {
  private cacheFile: string;
  private cache: Cache;
  private unitIds: string[];
  private jslibs: string[] = [];

  public constructor(cacheFile: string, unitIds: string[], cache: Cache, jslibs: string[]) {
    this.cacheFile = cacheFile;
    this.unitIds = unitIds;
    this.cache = cache;
    this.jslibs = jslibs;
  }

  public static async create(mainFile: string, unitIds: string[], jslibs: string[]) {
    const cacheFileName = "apitest" + md5(mainFile) + ".json";
    const cacheFile = path.resolve(os.tmpdir(), cacheFileName);
    const cache = await loadCache(cacheFile);
    const session = new Session(cacheFile, unitIds, cache, jslibs);
    return session;
  }

  public get cursor(): string {
    return this.cache.cursor;
  }

  public async getCtx(testcase: Case, reset = false): Promise<VmContext> {
    const idx = this.unitIds.findIndex(v => v === testcase.id);
    const state = { env: _.clone(process.env) };
    if (idx > -1) {
      for (let i = 0; i <= idx; i++) {
        const paths = this.unitIds[i].split(".");
        const obj = _.get(this.cache.tests, paths);
        if (obj) _.set(state, paths, _.clone(obj));
      }
    }
    for (let i = 1; i < testcase.paths.length; i++) {
      const scope = _.get(state, testcase.paths.slice(0, i));
      for (const key in scope) {
        const value = _.get(state, key);
        if (!value) _.set(state, key, scope[key]);
      }
    }
    const local = _.get(state, testcase.paths);
    if (local) Object.assign(state, local);
    if (
      !testcase.group &&
      (typeof _.get(state, ["req"]) === "undefined" || reset) &&
      (testcase as Unit).req.type === "Object") {
      const req = {};
      _.set(state, ["req"], req);
      _.set(this.cache.tests, testcase.paths.concat(["req"]), req);
    }
    return { state, jslibs: this.jslibs };
  }

  public async saveValue(testcase: Case, key: string, value: any, persist = true) {
    const data = _.get(this.cache.tests, testcase.paths);
    if (!data) {
      _.set(this.cache.tests, testcase.paths.concat([key]), value);
    } else {
      data[key] = value;
    }
    if (persist) await saveCache(this.cacheFile, this.cache);
  }

  public async clearCache() {
    this.cache = EMPTY_CACHE;
    await saveCache(this.cacheFile, this.cache);
  }

  public async saveCursor(id: string) {
    this.cache.cursor = id;
    await saveCache(this.cacheFile, this.cache);
  }

  public async clearCursor() {
    this.cache.cursor = "";
    await saveCache(this.cacheFile, this.cache);
  }
}

export interface VmContext {
  jslibs: string[],
  state: any;
}

export interface Cache {
  cursor: string;
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
    return EMPTY_CACHE;
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
