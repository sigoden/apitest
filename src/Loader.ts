import * as path from "path";
import * as fs from "fs/promises";
import * as vm from "vm";
import * as _ from "lodash";
import Cases from "./Cases";
import Clients from "./Clients";
import { loadJsonaFile, getType, toPosString  } from "./utils";
import { JsonaAnnotation, JsonaObject, JsonaProperty, JsonaValue } from "./types";

export interface Module {
  moduleName: string;
  properties: JsonaProperty[];
  describe: string;
}

export default class Loader {
  private workDir: string;
  private cases: Cases;
  private jslibs: string[] = [];
  private clients: Clients = new Clients();
  private modules: Module[] = [];
  private mixin: JsonaObject;

  public async load(target: string, env: string) {
    const { mainFile, workDir } = await this.findMainFile(target, env);
    this.workDir = workDir;

    let jsa: JsonaValue;
    try {
      jsa = await loadJsonaFile(mainFile);
    } catch (err) {
      throw new Error(`main: load ${path.basename(mainFile)} throw ${err.message}`);
    }
    if (jsa.type !== "Object") {
      throw new Error("main: should have object value");
    }
    this.modules.push({
      moduleName: "main",
      properties: jsa.properties,
      describe: this.retriveModuleDescribe("main", jsa),
    });
    for (const anno of jsa.annotations) {
      if (anno.name === "client") {
        await this.loadClient(anno);
      } else if (anno.name === "mixin") {
        await this.loadMixin(anno);
      } else if (anno.name === "jslib") {
        await this.loadJslib(anno);
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
      jslibs: this.jslibs,
    };
  }

  private async findMainFile(target: string, env: string) {
    try {
      if (target.endsWith(".jsona")) {
        const mainFile = path.resolve(env ? target.slice(0, -6) + "." + env + ".jsona" : target);
        const stat = await fs.stat(mainFile);
        if (stat.isFile()) {
          return { mainFile, workDir: path.resolve(target, "..") };
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
      throw new Error(`main@client: should have object value${toPosString(anno.position)}`);
    }
  }

  private async loadMixin(anno: JsonaAnnotation) {
    if (this.mixin) {
      throw new Error(`main@mixin: do not support multiple mixins${toPosString(anno.position)}`);
    }
    if (typeof anno.value === "string") {
      const mixinName = anno.value;
      const mixinFileName = `${mixinName}.jsona`;
      const mixinFile = path.resolve(this.workDir, mixinFileName);
      let jsa: JsonaValue;
      try {
        jsa = await loadJsonaFile(mixinFile);
      } catch (err) {
        throw new Error(`main@mixin(${mixinName}): load ${mixinFileName} throw ${err.message}`);
      }
      if (jsa.type !== "Object") {
        throw new Error(`main@mixin(${mixinName}): should have object value`);
      }
      this.mixin = jsa as JsonaObject;
    } else {
      throw new Error(`main@mixin: should have string value${toPosString(anno.position)}`);
    }
  }

  private async loadJslib(anno: JsonaAnnotation) {
    if (typeof anno.value === "string") {
      const libName = anno.value;
      const libFileName = `${libName}.js`;
      const  libFile = path.resolve(this.workDir, libFileName);
      let jslib;
      try {
        jslib = await fs.readFile(libFile, "utf8");
      } catch (err) {
        throw new Error(`main@jslib(${libName}): load ${libFileName} failed`);
      }
      try {
        const context = {};
        const script = new vm.Script(jslib);
        script.runInNewContext(context);
      } catch (err) {
        throw new Error(`main@jslib(${libName}): load ${libFileName} throw ${err.message}${toPosString(anno.position)}`);
      }
      this.jslibs.push(jslib);
    } else {
      throw new Error(`[main@jslib] should have string value${toPosString(anno.position)}`);
    }
  }

  private async loadModule(anno: JsonaAnnotation) {
    if (typeof anno.value === "string") {
      const moduleName = anno.value;
      const moduleFileName = `${moduleName}.jsona`;
      const moduleFile = path.resolve(this.workDir, moduleFileName);
      let jsa: JsonaValue;
      try {
        jsa = await loadJsonaFile(moduleFile);
      } catch (err) {
        throw new Error(`main@module(${moduleName}): load ${moduleFileName} throw ${err.message}`);
      }
      
      if (jsa.type !== "Object") {
        throw new Error(`main@module(${moduleName}): should have object value`);
      }
      const describe = this.retriveModuleDescribe(moduleName, jsa);
      this.modules.push({moduleName, properties: jsa.properties, describe});
    } else {
      throw new Error(`main@module: should have string value${toPosString(anno.position)}`);
    }
  }

  private retriveModuleDescribe(moduleName, value: JsonaValue) {
    const describeAnno = value.annotations.find(v => v.name === "describe");
    if (!describeAnno) return;
    if (typeof describeAnno.value === "string") {
      return describeAnno.value;
    } else {
      throw new Error(`${moduleName}@describe: should have string value${toPosString(describeAnno.position)}`);
    }
  }
}
