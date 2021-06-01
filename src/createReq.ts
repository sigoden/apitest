import { Unit } from "./Cases";
import * as vm from "vm";
import { JsonaString, JsonaValue } from "./types";
import * as _ from "lodash";
import { VmContext } from "./Session";
import { RunUnitError } from "./Reporter";

export default function createReq(unit: Unit, ctx: VmContext): any {
  const nextPaths = unit.paths.concat(["req"]);
  _.set(ctx.state, ["req"], _.get(ctx.state, nextPaths));
  return createValue(nextPaths, ctx, unit.req);
}

function createValue(paths: string[], ctx: VmContext, jsa: JsonaValue) {
  if (existAnno(paths, jsa, "eval", "string")) {
    const value = evalValue(paths, ctx, (jsa as JsonaString).value);
    _.set(ctx.state, paths, value);
    return value;
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

export function evalValue(paths: string[], ctx: VmContext, code: string): any {
  const expressions = code.split(";");
  if (!_.trim(_.last(expressions)).startsWith("return")) {
    expressions[expressions.length - 1] = "return " + expressions[expressions.length - 1];
  }
  const patchedCode = ctx.jslibs.join("\n") + expressions.join(";");
  const EXPORT_KEY = "__exports__";
  ctx.state[EXPORT_KEY] = null;
  try {
    const wrapCode = `${EXPORT_KEY} = (function(){${patchedCode}}())`;
    const script = new vm.Script(wrapCode);
    script.runInNewContext(ctx.state);
    return ctx.state[EXPORT_KEY];
  } catch (err) {
    throw new RunUnitError(paths, "eval", `throw err, ${err.message}`);
  }
}

export function existAnno(paths: string[], value: JsonaValue, name: string, type: string): boolean {
  const anno = value.annotations.find(v => v.name === name);
  if (!anno) return false;
  if (type === "any" || value.type.toLowerCase() === type) {
    return true;
  }
  throw new RunUnitError(paths, name, `should have ${type} value`);
}
