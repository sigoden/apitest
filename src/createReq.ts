import { Unit } from "./Cases";
import * as vm from "vm";
import { JsonaString, JsonaValue } from "./types";
import * as _ from "lodash";

export default function createReq(unit: Unit, ctx: any): any {
  return createValue(unit.paths.concat(["req"]), ctx, unit.req);
}

function createValue(paths: string[], ctx: any, jsa: JsonaValue) {
  if (existAnno(paths, jsa, "eval", "string")) {
    return evalValue(paths, ctx, (jsa as JsonaString).value);
  } else {
    if (jsa.type === "Array") {
      const output = [];
      for (const [i, ele] of jsa.elements.entries()) {
        output.push(createValue(paths.concat([String(i)]), ctx, ele));
      }
      return output;
    } else if (jsa.type === "Object") {
      const output = { } as {[k: string]: any};
      for (const prop of jsa.properties) {
        output[prop.key] = createValue(paths.concat([prop.key]), ctx, prop.value);
      }
      return output;
    } else if (jsa.type === "Null") {
      return null;
    } else {
      return jsa.value;
    }
  }
}

export function evalValue(paths: string[], ctx: any, code: string): any {
  const expressions = code.split(";");
  if (!_.trim(_.last(expressions)).startsWith("return")) {
    expressions[expressions.length - 1] = "return" + expressions[expressions.length - 1];
  }
  const patchedCode = expressions.join(";");
  const EXPORT_KEY = "__exports__";
  ctx[EXPORT_KEY] = null;
  try {
    const wrapCode = `${EXPORT_KEY} = (function(){${patchedCode}}())`;
    const script = new vm.Script(wrapCode);
    script.runInNewContext(ctx);
    return ctx[EXPORT_KEY];
  } catch (err) {
    throw { paths, anno: "eval", message: `throw err: ${err.message}` };
  }
}

export function existAnno(paths: string[], value: JsonaValue, name: string, type: string): boolean {
  const anno = value.annotations.find(v => v.name === name);
  if (!anno) return false;
  if (type === "any" || value.type.toLowerCase() === type) {
    return true;
  }
  throw { paths, anno: name, message: `should have ${type} value` };
}
