import * as _ from "lodash";
import * as fs from "fs/promises";
import * as crypto from "crypto";
import { JsonaAnnotation, parse } from "jsona-js";
import * as vm from "vm";
import { JsonaValue, JsonaObject, Position } from "jsona-js";
import { RunCaseError } from "./Reporter";
import { VmContext } from "./Session";

export async function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function md5(target: string) {
  const md5 = crypto.createHash("md5");
  return md5.update(target).digest("hex");
}

export function schemaValidate(target: any, paths: string[], schema: any, required: boolean) {
  const type = getType(target);
  const schemaTypes = Array.isArray(schema?.type) ? schema.type : [schema?.type];
  if (schemaTypes.indexOf(type) === -1) {
    if (type === "undefined" && !required) return;
    throw { paths, message: `should be ${schemaTypes.join(" or ")} value` };
  }
  if (type === "object") {
    const required = schema?.required || [];
    const keys = [];
    if (schema?.properties) {
      for (const key in schema.properties) {
        keys.push(key);
        schemaValidate(target[key], paths.concat(key), schema.properties[key], required.indexOf(key) > -1);
      }
    }
    if (schema?.anyProperties) {
      for (const key in target) {
        if (keys.indexOf(key) === -1) {
          schemaValidate(target[key], paths.concat(key), schema.anyProperties, false);
        }
      }
    }
  } else if (type === "array") {
    if (schema?.items) {
      for (const [i, item] of target.entries()) {
        schemaValidate(item, paths.concat(i), schema.items, true);
      }
    }
  }
}

export async function loadJsonaFile(file: string): Promise<JsonaValue> {
  let content: string;
  try {
    content = await fs.readFile(file, "utf8");
  } catch (err) {
    throw err;
  }
  const { jsona, error } =  parse(content);
  if (error) {
    if (error.position) throw new Error(`${error.info}${toPosString(error.position)}`);
  }
  return jsona;
}

export function toPosString(position: Position) {
  return ` at line ${position.line} col ${position.col}`;
}

export function createAnno(name: string, value: any): JsonaAnnotation {
  return { name, value, position: {col:0,index:0,line:0} };
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
    if (typeof value === "number") {
      if (Number.isInteger(value)) {
        return "integer";
      }
      return "float";
    }
    return typeof value;
  }
}

export function existAnno(paths: string[], value: JsonaValue, name: string, type: string): boolean {
  const anno = value.annotations.find(v => v.name === name);
  if (!anno) return false;
  if (type === "any" || value.type.toLowerCase() === type) {
    return true;
  }
  throw new RunCaseError(paths, name, `should have ${type} value`);
}

export function evalValue(paths: string[], ctx: VmContext, code: string, anno = "eval"): any {
  if (!code) return null;
  const trimedCode = _.trim(code);
  if (trimedCode.startsWith("{") && trimedCode.endsWith("}")) {
    code  = "(" + code + ")";
  }
  try {
    const script = new vm.Script(code);
    const state = _.merge({}, ctx.state, ctx.jslib);
    return script.runInNewContext(state);
  } catch (err) {
    throw new RunCaseError(paths, anno, `throw err, ${err.message}`);
  }
}

export interface CheckValueRule {
  paths: string[],
  type: string,
  required?: boolean; 
  check?: (paths: string[], value: JsonaValue) => void;
}


export function checkValue(paths: string[], value: JsonaValue, rules: CheckValueRule[]) {
  for (const rule of rules) {
    const len = rule.paths.length;
    if (len === 0) {
      ensureType(paths, value, rule.type);
      continue;
    }
    ensureType(paths, value, "Object");
    let currentValue = value as JsonaObject;
    for (let i = 0; i < len; i++) {
      const name = rule.paths[i];
      const localPaths = paths.concat(rule.paths.slice(0, i + 1));
      if (name === "*") {
        for (const prop of currentValue.properties) {
          const newPaths = localPaths.slice();
          newPaths[newPaths.length - 1] = prop.key;
          const transAnno = existAnno(localPaths, prop.value, "trans", "any");
          if (transAnno) break;
          checkValue(newPaths, prop.value, [{ paths: rule.paths.slice(i+1), type: rule.type, required: rule.required }]);
        }
      } else {
        const prop = currentValue.properties.find(v => v.key === name);
        const isLast = i === len - 1;
        if (!prop) {
          if (!rule.required) break;
          if (!isLast) break;
          throw new Error(`${localPaths.join(".")}: is required${toPosString(currentValue.position)}`);
        } else {
          const transAnno = existAnno(localPaths, prop.value, "trans", "any");
          if (transAnno) break;
        }
        if (!isLast) {
          ensureType(localPaths, prop.value, "Object");
          currentValue = prop.value as JsonaObject;
        } else {
          ensureType(localPaths, prop.value, rule.type);
          if (rule.check) rule.check(localPaths, prop.value);
        }
      }
    }
  }
}

export function ensureType(paths: string[], value: JsonaValue, type: string) {
  if (value.type !== type) {
    if (type === "Scalar" && (value.type !== "Object" && value.type !== "Array")) {
    } else if (type === "Header" && (value.type === "String" || value.type === "Array")) {
    } else {
      throw new Error(`${[paths.join(".")]}: should be ${type.toLowerCase()} value${toPosString(value.position)}`);
    }
  }
}

export function JSONReplacer(_key, value) {
  if (value?.type === "Buffer") {
    return "Buffer:" + Buffer.from(value.data).toString("base64");
  }
  return value;
}

export function JSONReplacer2(_key, value) {
  const MAX_BUFFER_SIZE = 512;
  const MAX_ARRAY_ELEMENTS = 10;
  const MAX_STRING_LENGTH = 1024;
  if (value?.type === "Buffer") {
    if (value.data.length > MAX_BUFFER_SIZE) {
      return "Buffer:" + Buffer.from(value.data.slice(0, MAX_BUFFER_SIZE)).toString("base64") + "...";
    } else {
      return "Buffer:" + Buffer.from(value.data).toString("base64");
    }
  } else if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_ELEMENTS)  {
      const content = JSON.stringify(value, JSONReplacer);
      if (content.length > MAX_STRING_LENGTH) {
        return "BigArray:" + content.substr(0, MAX_STRING_LENGTH) + "...";
      } else {
        return value;
      }
    }
  } else if (typeof value === "string") {
    if (value.length > MAX_STRING_LENGTH) {
      return value.substr(0, MAX_STRING_LENGTH) + "...";
    }
  }
  return value;
}

export function JSONReceiver(_key, value) {
  if (typeof value === "string" && value.startsWith("Buffer:")) {
    return Buffer.from(value.slice("Buffer:".length), "base64");
  }
  return value;
}
