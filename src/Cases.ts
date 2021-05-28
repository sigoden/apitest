import * as _ from "lodash";
import Clients from "./Clients";
import { JsonaObject, JsonaProperty, JsonaValue } from "./types";
import { toPosString } from "./utils";

export interface Unit {
  paths: string[];
}
export default class Cases {
  private describes: any = {};
  private units: Unit[] = [];
  private clients: Clients;
  private mixin: JsonaObject;

  public constructor(clients: Clients, mixin: JsonaObject, modules: [string, JsonaProperty[]][]) {
    this.clients = clients;
    this.mixin = mixin;
    for (const [moduleName, props] of modules) {
      for (const prop of props) {
        this.addProp([moduleName], prop);
      }
    }
  }

  private addProp(paths: string[], prop: JsonaProperty) {
    const nextPaths = paths.concat(prop.key);
    if (prop.value.type !== "Object") {
      throw new Error(`[${nextPaths.join(".")}] should have object value ${toPosString(prop.position)}`);
    }
    if (prop.value.annotations.find(v => v.name === "group")) {
      this.addGroup(nextPaths, prop.value);
    } else {
      this.addUnit(nextPaths, prop.value);
    }
  }

  private addGroup(paths: string[], value: JsonaValue) {
    if (value.type !== "Object") {
      throw new Error(`[${paths.join(".")}] should have object value ${toPosString(value.position)}`);
    }
    const valueObject = value as JsonaObject;
    const describe = this.retriveAnnoDescribe(paths, value);
    _.set(this.describes, paths, describe);
    for (const prop of valueObject.properties) {
      this.addProp(paths, prop);
    }
  }

  private addUnit(paths: string[], value: JsonaValue) {
    if (value.type !== "Object") {
      throw new Error(`[${paths.join(".")}] should have object value ${toPosString(value.position)}`);
    }
    const valueObject = value as JsonaObject;
    const describe = this.retriveAnnoDescribe(paths, value);
    _.set(this.describes, paths, describe);

    const mixins = this.retriveAnnoMixins(paths, value);
    
  }

  private retriveAnnoDescribe(paths: string[], value: JsonaValue): string {
    const describeAnno = value.annotations.find(v => v.name === "decribe");
    if (!describeAnno) return "";
    if (typeof describeAnno.value !== "string") {
      throw new Error(`[${paths.join(".")}@describe] should have string value ${toPosString(describeAnno.position)}`);
    }
    return describeAnno.value;
  }

  private retriveAnnoMixins(paths: string[], value: JsonaValue): JsonaObject[] {
    const mixinAnno = value.annotations.find(v => v.name === "mixin");
    if (!mixinAnno) return [];
    let mixinNames = [];
    if (typeof mixinAnno.value === "string") {
      mixinNames = [mixinAnno.value];
    } else if (Array.isArray(mixinAnno.value)) {
      mixinNames = mixinAnno.value;
    } else {
      throw new Error(`[${paths.join(".")}@mixin] should have array value ${toPosString(mixinAnno.position)}`);
    }
    const result = [];
    for (const name of mixinNames) {
      const prop = this.mixin.properties.find(v => v.key === "name");
      if (!prop) {
        throw new Error(`[${paths.join(".")}@mixin] miss mixin ${name}, ${toPosString(mixinAnno.position)}`);
      }
      if (prop.value.type !== "Object") {
        throw new Error(`[${paths.join(".")}@mixin] mixin ${name} should be object, ${toPosString(mixinAnno.position)}`);
      }
      result.push(prop.value as JsonaObject);
    }
    return result;
  }
}
