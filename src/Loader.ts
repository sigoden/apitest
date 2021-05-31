import * as path from "path";
import * as fs from "fs/promises";
import { parse } from "jsona-js";
import { JsonaAnnotation, JsonaObject, JsonaProperty, JsonaValue, Position } from "./types";
import * as _ from "lodash";
import Cases from "./Cases";
import Clients from "./Clients";

export default class Loader {
  private workDir: string;
  private cases: Cases;
  private clients: Clients = new Clients();
  private modules: [string, JsonaProperty[]][] = [];
  private mixin: JsonaObject;

  public async load(target: string, env: string) {
    const { mainFile, workDir } = await this.findMainFile(target, env);
    this.workDir = workDir;

    let jsa: JsonaValue;
    try {
      jsa = await loadJsonaFile(mainFile);
    } catch (err) {
      throw new Error(`[main] parse error: ${err.message}`);
    }
    if (jsa.type !== "Object") {
      throw new Error("[main] should have object value");
    }
    this.modules.push(["main", jsa.properties]);
    for (const anno of jsa.annotations) {
      if (anno.name === "client") {
        await this.loadClient(anno);
      } else if (anno.name === "mixin") {
        await this.loadMixin(anno);
      } else if (anno.name === "module") {
        await this.loadModule(anno);
      }
    }
    this.clients.ensureDefault();

    this.cases = new Cases(this.clients, this.mixin, this.modules);

    return {
      mainFile,
      cases: this.cases,
      clients: this.clients,
    };
  }

  private async findMainFile(target: string, env: string) {
    try {
      if (target.endsWith(".jsona")) {
        const stat = await fs.stat(target);
        if (stat.isFile()) {
          return { mainFile: path.resolve(target), workDir: path.resolve(target, "..") };
        }
      }
      const envName = env ? "." + env : "";
      let mainFile = path.resolve(target, `main${envName}.jsona`);
      let stat = await fs.stat(mainFile);
      if (stat.isFile()) {
        return { mainFile, workDir: path.resolve(target) };
      }

      const baseName = path.basename(target);
      mainFile = path.resolve(target, `${baseName}${envName}.jsona`);
      stat = await fs.stat(mainFile);
      if (stat.isFile()) {
        return { mainFile, workDir: path.resolve(target) };
      }
    } catch (err){
      throw new Error("not found main jsona file");
    }
  }


  private async loadClient(anno: JsonaAnnotation) {
    if (getType(anno.value) === "object") {
      this.clients.addClient(anno);
    } else {
      throw new Error(`[main@client] should have object value${toPosString(anno.position)}`);
    }
  }

  private async loadMixin(anno: JsonaAnnotation) {
    if (this.mixin) {
      throw new Error(`[main@mixin] only need one${toPosString(anno.position)}`);
    }
    if (typeof anno.value === "string") {
      const mixinName = anno.value;
      const mixinFile = path.resolve(this.workDir, `${mixinName}.jsona`);
      let jsa: JsonaValue;
      try {
        jsa = await loadJsonaFile(mixinFile);
      } catch (err) {
        throw new Error(`[${mixinName}] parse error: ${err.message}`);
      }
      if (jsa.type !== "Object") {
        throw new Error(`[${mixinName}] should have object value`);
      }
      this.mixin = jsa as JsonaObject;
    } else {
      throw new Error(`[main@mixin] should have string value${toPosString(anno.position)}`);
    }
  }

  private async loadModule(anno: JsonaAnnotation) {
    if (typeof anno.value === "string") {
      const moduleName = anno.value;
      const moduleFile = path.resolve(this.workDir, `${moduleName}.jsona`);
      let jsa: JsonaValue;
      try {
        jsa = await loadJsonaFile(moduleFile);
      } catch (err) {
        throw new Error(`[${moduleName}] parse error: ${err.message}`);
      }
      
      if (jsa.type !== "Object") {
        throw new Error(`[${moduleName}] should have object value`);
      }
      this.modules.push([moduleName, jsa.properties]);
    } else {
      throw new Error(`[main@module] should have string value${toPosString(anno.position)}`);
    }
  }
}

async function loadJsonaFile(file: string): Promise<JsonaValue> {
  try {
    const content = await fs.readFile(file, "utf8");
    return parse(content);
  } catch (err) {
    if (err.position) throw new Error(`${err.info}${toPosString(err.position)}`);
    throw err;
  }
}

export function toPosString(position: Position) {
  if (position.mixin) {
    return " at mixin";
  }
  return ` at line ${position.line} col ${position.col}`;
}

export function getType(value) {
  if (value === null) {
    return "null";
  } else if (typeof value === "object") {
    if (Array.isArray(value)) {
      return "array";
    } else {
      return "object";
    }
  } else {
    return typeof value;
  }
}
