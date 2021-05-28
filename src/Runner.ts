import * as path from "path";
import * as fs from "fs/promises";
import { parse, parseAsJSON } from "jsona-js";
import Cases from "./Cases";
import { JsonaAnnotation } from "./types";
import Clients from "./Clients";
import { toPosString } from "./utils";

export default class Runner {
  private workDir: string;
  private env: string;
  private cases: Cases;
  private clients: Clients;
  private mixin: any;
  private constructor(workDir: string, env: string) {
    this.workDir = workDir;
    this.env = env;
    this.cases = new Cases();
    this.clients = new Clients();
  }

  public static async create(workDir: string, env: string) {
    workDir = path.resolve(workDir);
    try {
      const stat = await fs.stat(workDir);
      if (!stat.isDirectory) throw new Error();
    } catch (err) {
      throw new Error(`${workDir} not found or not directory`);
    }
    const runner = new Runner(workDir, env);
    await runner.loadMain();
    return runner;
  }

  public async runOnly(name: string) {

  }

  public async runCi() {

  }

  public async run(reset: boolean) {

  }

  private async loadMain() {
    const moduleName = "main";
    const mainFileName = this.env ? `${moduleName}.${this.env}.jsona` : `${moduleName}.jsona`;
    const mainFile = path.resolve(this.workDir, mainFileName);
    let jsa;
    try {
      jsa = await loadJsonaFile(mainFile);
    } catch (err) {
      throw new Error(`[${moduleName}] parse error: ${err.message}`);
    }
    if (jsa.type !== "Object") {
      throw new Error(`[${moduleName}] should have object value`);
    }
    for (const prop of jsa.properties) {
      await this.cases.addProp(moduleName, prop);
    }
    for (const anno of jsa.annotations) {
      if (anno.name === "client") {
        await this.loadClient(anno);
      } else if (anno.name === "mixin") {
        await this.loadMixin(anno);
      } else if (anno.name === "module") {
        await this.loadModule(anno);
      }
    }
  }

  private async loadClient(anno: JsonaAnnotation) {
    if (anno.value !== null && typeof anno.value === "object") {
      this.clients.addClient(anno);
    } else {
      throw new Error(`[main.@client] should have object value ${toPosString(anno.position)}`);
    }
  }

  private async loadMixin(anno: JsonaAnnotation) {
    if (this.mixin) {
      throw new Error(`[main.@mixin] only need one ${toPosString(anno.position)}`);
    }
    if (typeof anno.value === "string") {
      const mixinName = anno.value;
      let jsa;
      try {
        jsa = await loadJsonaFile(mixinName);
      } catch (err) {
        throw new Error(`[${mixinName}] parse error: ${err.message}`);
      }
      if (jsa.type !== "Object") {
        throw new Error(`[${mixinName}] should have object value`);
      }
      this.mixin = jsa;
    } else {
      throw new Error(`[main.@mixin] should have string value ${toPosString(anno.position)}`);
    }
  }

  private async loadModule(anno: JsonaAnnotation) {
    if (typeof anno.value === "string") {
      const moduleName = anno.value;
      const moduleFile = path.resolve(this.workDir, `${moduleName}.jsona`);
      let jsa;
      try {
        jsa = await loadJsonaFile(moduleFile);
      } catch (err) {
        throw new Error(`[${moduleName}] parse error: ${err.message}`);
      }
      
      if (jsa.type !== "Object") {
        throw new Error(`[${moduleName}] should have object value`);
      }
      for (const prop of jsa.properties) {
        await this.cases.addProp(moduleName, prop);
      }
    } else {
      throw new Error(`[main.@module] should have string value ${toPosString(anno.position)}`);
    }
  }
}

async function loadJsonaFile(file: string) {
  try {
    const content = await fs.readFile(file, "utf8");
    return parse(content);
  } catch (err) {
    if (err.position) throw new Error(`${err.info} ${toPosString(err.position)}`);
    throw err;
  }
}
