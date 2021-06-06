import { Unit } from "./Cases";
import * as vm from "vm";
import { JsonaString, JsonaValue } from "jsona-js";
import * as fake from "@sigodenjs/fake/lib/exec";
import "@sigodenjs/fake/lib/cn";
import * as _ from "lodash";
import { VmContext } from "./Session";
import { RunCaseError } from "./Reporter";

export default function createReq(unit: Unit, ctx: VmContext): any {
  const nextPaths = unit.paths.concat(["req"]);
  return createValue(nextPaths, ctx, unit.req);
}

function createValue(paths: string[], ctx: VmContext, jsa: JsonaValue) {
  if (existAnno(paths, jsa, "eval", "string")) {
    const value = evalValue(paths, ctx, (jsa as JsonaString).value);
    _.set(ctx.state, paths, value);
    return value;
  } else if(existAnno(paths, jsa, "mock", "string")) {
    const value = (jsa as JsonaString).value;
    try {
      const mockValue = fake(value);
      _.set(ctx.state, paths, mockValue);
      return mockValue;
    } catch(err) {
      throw new RunCaseError(paths, "mock", `bad mock '${value}'`);
    }
  } else {
    if (jsa.type === "Array") {
      _.set(ctx.state, paths, _.get(ctx.state, paths, []));
      const output = _.get(ctx.state, paths);
      for (const [i, ele] of jsa.elements.entries()) {
        output.push(createValue(paths.concat([String(i)]), ctx, ele));
      }
      return output;
    } else if (jsa.type === "Object") {
      _.set(ctx.state, paths, _.get(ctx.state, paths, {}));
      const output = _.get(ctx.state, paths);
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
  if (!code) return null;
  const expressions = _.trimEnd(code.trim(), ";").split(";").map(v => v.trim());
  const lastIdx = expressions.length - 1;
  if (!expressions[lastIdx].trim().startsWith("return")) {
    expressions[lastIdx] = "return " + expressions[lastIdx];
  }
  const patchedCode = ctx.jslibs.join("\n") + expressions.join(";");
  const EXPORT_KEY = "__exports__";
  ctx.state[EXPORT_KEY] = null;
  try {
    const wrapCode = `${EXPORT_KEY} = (function(){${patchedCode};}())`;
    const script = new vm.Script(wrapCode);
    script.runInNewContext(ctx.state);
    return ctx.state[EXPORT_KEY];
  } catch (err) {
    throw new RunCaseError(paths, "eval", `throw err, ${err.message}`);
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
