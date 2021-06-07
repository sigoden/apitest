import * as os from "os";
import * as path from "path";
import * as fs from "fs/promises";
import * as _ from "lodash";
import { Case, Unit } from "./Cases";
import { JSONReceiver, JSONReplacer, md5 } from "./utils";
import { JSLib } from "./Loader";

export const EMPTY_CACHE = { cursor: "", tests: {} };

export default class Session {
  private cacheFile: string;
  private cache: Cache;
  private unitIds: string[];
  private workDir: string;
  private jslib: JSLib;

  public constructor(cacheFile: string, unitIds: string[], cache: Cache, jslib: JSLib, workDir: string) {
    this.cacheFile = cacheFile;
    this.unitIds = unitIds;
    this.cache = cache;
    this.jslib = jslib;
    this.workDir = workDir;
  }

  public static async create(mainFile: string, unitIds: string[], jslib: any, workDir: string) {
    const cacheFileName = "apitest" + md5(mainFile) + ".json";
    const cacheFile = path.resolve(os.tmpdir(), cacheFileName);
    const cache = await loadCache(cacheFile);
    const session = new Session(cacheFile, unitIds, cache, jslib, workDir);
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
    return { state, jslib: this.jslib, workDir: this.workDir };
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
  jslib: JSLib,
  state: any;
  workDir: string;
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
    const cache = JSON.parse(content, JSONReceiver);
    return cache;
  } catch (err) {
    return EMPTY_CACHE;
  }
}

async function saveCache(cacheFile: string, cache: Cache) {
  const content = JSON.stringify(cache, JSONReplacer);
  await fs.writeFile(cacheFile, content);
}
