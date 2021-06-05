import * as _ from "lodash";
import Clients, { UnitClient } from "./Clients";
import { JsonaAnnotation, JsonaArray, JsonaObject, JsonaProperty, JsonaValue, Position } from "./types";
import { getType, toPosString } from "./utils";

const DEFAULT_CLIENT: UnitClient = { name: "default", options: {} };
const ZERO_POSITION: Position = { col: 0, index: 0, line: 0 };

export type Case = Group | Unit;


export interface Group {
  id: string;
  paths: string[];
  group: true;
  cases: Case[];
  prev?: string;
  mixins: JsonaObject[];
  client?: UnitClient;
  run?: JsonaValue;
}

export interface Unit {
  id: string;
  paths: string[];
  group: false;
  client: UnitClient;
  req: JsonaValue;
  res?: JsonaValue;
  run?: JsonaValue;
}

export default class Cases {
  public describes: {[k: string]: string} = {};
  public caseIds: string[] = [];
  public cases: Case[] = [];
  private clients: Clients;
  private mixin: JsonaObject;

  public constructor(clients: Clients, mixin: JsonaObject, modules: [string, JsonaProperty[]][]) {
    this.clients = clients;
    this.mixin = mixin;
    for (const [moduleName, props] of modules) {
      this.describes[moduleName] = "module " + moduleName;
      for (const prop of props) {
        this.addProp([moduleName], prop);
      }
    }
  }

  private addProp(paths: string[], prop: JsonaProperty, parent?: Group) {
    if (!/^\w+$/.test(prop.key)) {
      throw new Error(`${paths.join(".")}: prop '${prop.key}' should satify rules of variable name${toPosString(prop.position)}`);
    }
    const nextPaths = paths.concat(prop.key);
    if (prop.value.type !== "Object") {
      throw new Error(`${nextPaths.join(".")}: should have object value${toPosString(prop.position)}`);
    }
    if (prop.value.annotations.find(v => v.name === "group")) {
      this.addGroup(nextPaths, prop.value, parent);
    } else {
      this.addUnit(nextPaths, prop.value, parent);
    }
  }

  private addGroup(paths: string[], value: JsonaValue, parent?: Group) {
    if (value.type !== "Object") {
      throw new Error(`${paths.join(".")}: should have object value${toPosString(value.position)}`);
    }

    const group: Group = {
      id: paths.join("."),
      paths,
      cases: [],
      mixins: [],
      group: true,
    };

    const valueObject = value as JsonaObject;
    let describe = this.retriveAnnoDescribe(paths, value);
    if (!describe) describe = "group " + _.last(paths);
    this.describes[paths.join(".")] = describe;

    const client = this.retriveAnnoClient(paths, value);
    if (client) {
      group.client = client;
    } else if (parent?.client) {
      group.client = parent.client;
    }

    const parentMixins = parent?.mixins || [];

    group.mixins = [ ...this.retriveAnnoMixins(paths, value), ...parentMixins ];

    this.caseIds.push(group.paths.join("."));

    const cases = parent ? parent.cases : this.cases;
    const prevCase = cases[cases.length - 1];
    if (prevCase) group.prev = prevCase.id;
    cases.push(group);

    for (const prop of valueObject.properties) {
      if (prop.key === "run") {
        group.run = this.retriveRun(paths, prop);
        continue;
      }
      this.addProp(paths, prop, group);
    }
  }

  private addUnit(paths: string[], value: JsonaValue, parent?: Group) {
    if (value.type !== "Object") {
      throw new Error(`${paths.join(".")}: should have object value${toPosString(value.position)}`);
    }
    const valueObject = value as JsonaObject;

    let describe = this.retriveAnnoDescribe(paths, value);
    if (!describe) describe = "unit " + _.last(paths);
    this.describes[paths.join(".")] = describe;

    let client = this.retriveAnnoClient(paths, value);

    if (!client) {
      client = parent?.client || _.clone(DEFAULT_CLIENT);
    }

    let mixins = this.retriveAnnoMixins(paths, value);
    if (parent) mixins = [...mixins, ...parent.mixins];

    for (const mixin of mixins) {
      mergeMixin(valueObject, mixin);
    }

    const reqProp = value.properties.find(v => v.key === "req");
    if (!reqProp) {
      throw new Error(`${[...paths, "req"].join(".")}: is required${toPosString(value.position)}`);
    }
    const req = reqProp.value;

    const unit: Unit = { id: paths.join("."), paths, group: false, client, req };

    const resProp = value.properties.find(v => v.key === "res");
    if (resProp) {
      unit.res = resProp.value;
    }

    const runProp = value.properties.find(v => v.key === "run");
    if (runProp) {
      unit.run = this.retriveRun(paths, runProp);
    }

    this.clients.validateUnit(unit);

    this.caseIds.push(unit.id);

    if (!parent) {
      this.cases.push(unit);
    } else {
      parent.cases.push(unit);
    }
  }

  private retriveRun(paths: string[], prop: JsonaProperty): JsonaValue {
    if (prop.value.type !== "Object") {
      throw new Error(`${paths.join(".")}: should be object value${toPosString(prop.position)}`);
    }
    return prop.value;
  }

  private retriveAnnoDescribe(paths: string[], value: JsonaValue): string {
    const describeAnno = value.annotations.find(v => v.name === "describe");
    if (!describeAnno) return "";
    if (typeof describeAnno.value !== "string") {
      throw new Error(`${paths.join(".")}@describe: should have string value${toPosString(describeAnno.position)}`);
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
      throw new Error(`${paths.join(".")}@mixin: should have string or array value${toPosString(mixinAnno.position)}`);
    }
    const result = [];
    for (const name of mixinNames) {
      const prop = this.mixin.properties.find(v => v.key === name);
      if (!prop) {
        throw new Error(`${paths.join(".")}@mixin: ${name} is miss${toPosString(mixinAnno.position)}`);
      }
      if (prop.value.type !== "Object") {
        throw new Error(`${paths.join(".")}@mixin: ${name} should be object${toPosString(mixinAnno.position)}`);
      }
      result.push(cloneMixin(prop.value) as JsonaObject);
    }
    return result;
  }

  private retriveAnnoClient(paths: string[], value: JsonaValue): UnitClient {
    const clientAnno = value.annotations.find(v => v.name === "client");
    if (!clientAnno) return;
    if (typeof clientAnno.value === "string") {
      return { name: clientAnno.value, options: { } };
    } else if (getType(clientAnno.value) === "object") {
      return { name: "default", ...clientAnno.value } as UnitClient;
    } else {
      throw new Error(`${paths.join(".")}@client: should have string or object value${toPosString(clientAnno.position)}`);
    }
  }
}

function cloneMixin(value: JsonaValue) {
  let result: JsonaValue;
  if (value.type === "Array") {
    const newValue: JsonaArray = {
      type: "Array",
      elements: value.elements.map(v => cloneMixin(v)),
      position: _.clone(ZERO_POSITION),
      annotations: value.annotations.map(v => cloneMixinAnnotation(v)),
    };
    result = newValue;
  } else if (value.type === "Object") {
    const newValue: JsonaObject = {
      type: "Object",
      properties: value.properties.map(v => cloneMixinProperty(v)),
      position: _.clone(ZERO_POSITION),
      annotations: value.annotations.map(v => cloneMixinAnnotation(v)),
    };
    result = newValue;
  } else if (value.type === "Null") {
    result = {
      type: value.type,
      position: _.clone(ZERO_POSITION),
      annotations: value.annotations.map(v => cloneMixinAnnotation(v)),
    };
  } else {
    result = {
      type: value.type,
      value: value.value,
      position: _.clone(ZERO_POSITION),
      annotations: value.annotations.map(v => cloneMixinAnnotation(v)),
    } as JsonaValue; 
  }
  return result;
}

function cloneMixinAnnotation(anno: JsonaAnnotation): JsonaAnnotation {
  return {
    name: anno.name,
    position: _.clone(ZERO_POSITION),
    value: _.clone(anno.value),
  };
}

function cloneMixinProperty(prop: JsonaProperty): JsonaProperty {
  return {
    key: prop.key,
    position: _.clone(ZERO_POSITION),
    value: cloneMixin(prop.value),
  };
}

function mergeMixin(v1: JsonaObject, v2: JsonaObject) {
  const v2MatchKeys = [];
  for (const prop of v1.properties) {
    const findIdx = v2.properties.findIndex(v => v.key === prop.key);
    if (findIdx > -1) {
      const matchProp = v2.properties[findIdx];
      v2MatchKeys.push(matchProp.key);
      if (prop.value.type === "Object" && matchProp.value.type === "Object") {
        mergeMixin(prop.value, matchProp.value);
      }
    }
  }
  v1.properties = v1.properties.concat(v2.properties.filter(v => v2MatchKeys.indexOf(v.key) === -1));
  for (const anno of v2.annotations) {
    const matchAnno = v1.annotations.find(v => v.name === anno.name);
    if (!matchAnno) v1.annotations.push(anno);
  }
}
