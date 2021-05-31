import * as _ from "lodash";
import { Unit, UnitFail } from "./Cases";
import { JsonaArray, JsonaString, JsonaValue } from "./types";
import { existAnno, evalValue } from "./createReq";
import { getType } from "./Loader";

export default function compareRes(unit: Unit, ctx: any, res: any) {
  return compareValue(unit.paths.concat(["res"]), ctx, unit.res, res);
}

function compareValue(paths: string[], ctx: any, v1: JsonaValue, v2: any) {
  if (existAnno(paths, v1, "eval", "string")) {
    const pass = evalValue(paths, ctx, (v1 as JsonaString).value);
    if (typeof pass !== "boolean") {
      throw { paths, anno: "eval",  message: "should return bool" };
    }
    if (pass) return;
    throw { paths, anno: "eval",  message: "fail" };
  } else if (existAnno(paths, v1, "query", "string")) {
    const value = evalValue(paths, ctx, (v1 as JsonaString).value);
    if (_.isEqual(value, v2)) return;
    throw { paths, anno: "query",  message: "fail" };
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
    throw { paths, anno: "some",  message: "fail" };
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
    throw { paths, anno: "every",  message: "fail" };
  } else if (existAnno(paths, v1, "exist", "any")) {
    if (v1.type === "Null") {
      return;
    }
    const v1Type = v1.type.toLowerCase();
    const v2Type = getType(v2);
    if (v1Type !== v2Type) {
      throw { paths, anno: "exist", message: `fail, expect type ${v1Type} but got type ${v2Type}` };
    }
  } else {
    const v1Type = v1.type.toLowerCase();
    const v2Type = getType(v2);
    if (v1Type !== v2Type) {
      throw { paths, anno: "", message: `fail, expect type ${v1Type} but got type ${v2Type}` };
    }
    if (typeof v2 !== "object") {
      const v1Value = _.get(v1, "value", null);
      if (v1Value === v2) return;
      throw { paths, anno: "", message: "fail, expect value is not equal to actual value" };
    }
    if (v1.type === "Object") {
      if (!existAnno(paths, v1, "partial", "object")) {
        const v1Keys = v1.properties.map(v => v.key);
        const v2Keys = Object.keys(v2);
        if (v1Keys.length !== v2Keys.length) {
          throw { paths, anno: "", message: "fail, keys of expect value is not equal to keys of actual value" };
        }
      }
      for (const prop of v1.properties) {
        compareValue(paths.concat([prop.key]), ctx, prop.value, v2[prop.key]);
      }
    } else if (v1.type === "Array") {
      if (!existAnno(paths, v1, "partial", "array")) {
        if (v1.elements.length !== v2.length) {
          throw { paths, anno: "", message: "fail, length of expect value is not equal to length of actual value" };
        }
      }
      for (const [i, ele] of v1.elements.entries()) {
        compareValue(paths.concat([String(i)]), ctx, ele, v2[i]);
      }
    }
  }
}
