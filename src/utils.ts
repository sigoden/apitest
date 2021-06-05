import * as _ from "lodash";
import * as fs from "fs/promises";
import { RunCaseError } from "./Reporter";
import { parse } from "jsona-js";
import { JsonaValue, Position } from "./types";

export async function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function validate(target: any, paths: string[], schema: any, required: boolean) {
  const type = getType(target);
  const schemaTypes = Array.isArray(schema?.type) ? schema.type : [schema?.type];
  if (schemaTypes.indexOf(type) === -1) {
    if (type === "undefined" && !required) return;
    throw { paths, message: `should be ${schemaTypes.join(" or ")} value` };
  }
  if (type === "object") {
    const required = schema?.required || [];
    if (schema?.properties) {
      for (const key in schema.properties) {
        validate(target[key], paths.concat(key), schema.properties[key], required.indexOf(key) > -1);
      }
    }
  } else if (type === "array") {
    if (schema?.items) {
      for (const [i, item] of target.entries()) {
        validate(item, paths.concat(i), schema.items, true);
      }
    }
  }
}

export async function loadJsonaFile(file: string): Promise<JsonaValue> {
  try {
    const content = await fs.readFile(file, "utf8");
    return parse(content);
  } catch (err) {
    if (err.position) throw new Error(`${err.info}${toPosString(err.position)}`);
    throw err;
  }
}

export function toPosString(position: Position) {
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
    if (typeof value === "number") {
      if (Number.isInteger(value)) {
        return "integer";
      }
      return "float";
    }
    return typeof value;
  }
}
