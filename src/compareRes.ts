import * as _ from "lodash";
import { Unit } from "./Cases";
import { JsonaArray, JsonaString, JsonaValue } from "./types";
import { existAnno, evalValue } from "./createReq";
import { getType } from "./Loader";
import { VmContext } from "./Session";
import { RunUnitError } from "./Reporter";

export default function compareRes(unit: Unit, ctx: VmContext, res: any) {
  if (!unit.res) return;
  return compareValue(unit.paths.concat(["res"]), ctx, unit.res, res);
}

function compareValue(paths: string[], ctx: VmContext, v1: JsonaValue, v2: any) {
  if (existAnno(paths, v1, "eval", "string")) {
    ctx.state.$ = v2;
    const pass = evalValue(paths, ctx, (v1 as JsonaString).value);
    if (typeof pass !== "boolean") {
      throw new RunUnitError(paths, "eval",  "should return bool");
    }
    if (pass) return;
    throw new RunUnitError(paths, "eval",  "fail, eval returns false");
  } else if (existAnno(paths, v1, "query", "string")) {
    ctx.state.$ = v2;
    const value = evalValue(paths, ctx, (v1 as JsonaString).value);
    if (_.isEqual(value, v2)) return;
    throw new RunUnitError(paths, "query", `fail, query value ${value} ≠ actual value ${v2}`);
  } else if (existAnno(paths, v1, "some", "array")) {
    const v1_ = v1 as JsonaArray;
    let pass = false;
    for (const [i, ele] of v1_.elements.entries()) {
      try {
        compareValue(paths.concat([String(i)]), ctx, ele, v2);
        pass = true;
        break;
      } catch {}
    }
    if (pass) return;
    throw  new RunUnitError(paths, "some", "fail, no test pass");
  } else if (existAnno(paths, v1, "every", "array")) {
    const v1_ = v1 as JsonaArray;
    let pass = true;
    for (const [i, ele] of v1_.elements.entries()) {
      try {
        compareValue(paths.concat([String(i)]), ctx, ele, v2);
      } catch {
        pass = false;
        break;
      }
    }
    if (pass) return;
    throw new RunUnitError(paths, "every", "fail, not all tests pass");
  } else if (existAnno(paths, v1, "type", "any")) {
    if (v1.type === "Null") {
      return;
    }
    const v1Type = v1.type.toLowerCase();
    const v2Type = getType(v2);
    if (v1Type !== v2Type) {
      if (!(v2Type === "number" && (v1Type === "float" || v1Type === "integer"))) {
        throw new RunUnitError(paths, "type", `fail, expect type ${v1Type} ≠ actual type ${v2Type}`);
      }
    }
  } else {
    const v1Type = v1.type.toLowerCase();
    const v2Type = getType(v2);
    if (v1Type !== v2Type) {
      if (!(v2Type === "number" && (v1Type === "float" || v1Type === "integer"))) {
        throw new RunUnitError(paths,  "", `fail, expect type ${v1Type} ≠ actual type ${v2Type}`);
      }
    }
    if (typeof v2 !== "object") {
      const v1Value = _.get(v1, "value", null);
      if (v1Value === v2) return;
      throw new RunUnitError(paths, "", `fail, expect value ${v1Value} ≠ actual value ${v2}`);
    }
    if (v1.type === "Object") {
      if (!existAnno(paths, v1, "partial", "object")) {
        const v1Keys = v1.properties.map(v => v.key);
        const v2Keys = Object.keys(v2);
        if (v1Keys.length !== v2Keys.length) {
          throw new RunUnitError(paths, "", "fail, keys length of expect value ≠ keys length of actual value");
        }
      }
      for (const prop of v1.properties) {
        compareValue(paths.concat([prop.key]), ctx, prop.value, v2[prop.key]);
      }
    } else if (v1.type === "Array") {
      if (!existAnno(paths, v1, "partial", "array")) {
        if (v1.elements.length !== v2.length) {
          throw new RunUnitError(paths, "", "fail, length of expect value ≠ length of actual value");
        }
      }
      for (const [i, ele] of v1.elements.entries()) {
        compareValue(paths.concat([String(i)]), ctx, ele, v2[i]);
      }
    }
  }
}
