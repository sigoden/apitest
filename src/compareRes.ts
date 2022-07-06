import * as _ from "lodash";
import { Unit } from "./Cases";
import { JsonaArray, JsonaString, JsonaValue } from "jsona-js";
import { existAnno, evalValue } from "./utils";
import { getType } from "./utils";
import { VmContext } from "./Session";
import { RunCaseError } from "./Reporter";

export default async function compareRes(unit: Unit, ctx: VmContext, res: any) {
  if (!unit.res) return;
  return compareValue(unit.paths.concat(["res"]), ctx, unit.res, res);
}

async function compareValue(paths: string[], ctx: VmContext, v1: JsonaValue, v2: any) {
  if (existAnno(paths, v1, "trans", "any")) {
    const transAnno = v1.annotations.find(v => v.name === "trans");
    _.set(ctx.state, "$", v2);
    v2 = evalValue(paths, ctx, transAnno.value, "trans");
    _.set(ctx.state, "$", null);
  }

  if (existAnno(paths, v1, "nullable", "any") && v2 == null) return;

  if (existAnno(paths, v1, "eval", "string")) {
    ctx.state.$ = v2;
    const value = evalValue(paths, ctx, (v1 as JsonaString).value);
    if (typeof value === "boolean") {
      if (value) return;
      throw new RunCaseError(paths, "eval",  "eval expr fail");
    }
    if (_.isEqual(value, v2)) return;
    throw new RunCaseError(paths, "eval",  "eval expr fail");
  } else if (existAnno(paths, v1, "some", "array")) {
    const v1_ = v1 as JsonaArray;
    let pass = false;
    const subErrors: RunCaseError[] = [];
    for (const [i, ele] of v1_.elements.entries()) {
      try {
        await compareValue(paths.concat([String(i)]), ctx, ele, v2);
        pass = true;
        break;
      } catch (err) {
        subErrors.push(err);
      }
    }
    if (pass) return;
    throw new RunCaseError(paths, "some", "no test pass", subErrors);
  } else if (existAnno(paths, v1, "every", "array")) {
    const v1_ = v1 as JsonaArray;
    let pass = true;
    const subErrors: RunCaseError[] = [];
    for (const [i, ele] of v1_.elements.entries()) {
      try {
        await compareValue(paths.concat([String(i)]), ctx, ele, v2);
      } catch (err) {
        pass = false;
        subErrors.push(err);
        break;
      }
    }
    if (pass) return;
    throw new RunCaseError(paths, "every", "some test fail", subErrors);
  } else if (existAnno(paths, v1, "type", "any")) {
    if (v1.type === "Null" || v2 === null) {
      return;
    }
    const v1Type = v1.type.toLowerCase();
    const v2Type = getType(v2);
    if (v1Type !== v2Type) {
      throw new RunCaseError(paths, "type", `type ${v2Type} ≠ type ${v1Type}`);
    }
  } else {
    const v1Type = v1.type.toLowerCase();
    const v2Type = getType(v2);
    if (v1Type !== v2Type) {
      throw new RunCaseError(paths,  "", `type ${v2Type} ≠ type ${v1Type}`);
    }
    if (typeof v2 !== "object") {
      const v1Value = _.get(v1, "value", null);
      if (v1Value === v2) return;
      throw new RunCaseError(paths, "", `${v1Value} ≠ ${v2}`);
    }
    if (v1.type === "Object") {
      const optionalFields = v1.properties.filter(v => !!v.value.annotations.find(v => v.name === "optional")).map(v => v.key);
      if (!existAnno(paths, v1, "partial", "object")) {
        let v1Keys = v1.properties.map(v => v.key);
        v1Keys = _.difference(v1Keys, optionalFields);
        const v2Keys = Object.keys(v2);
        if (v1Keys.length !== v2Keys.length) {
          const v1x = _.difference(v1Keys, v2Keys);
          const v2x = _.difference(v2Keys, v1Keys);
          throw new RunCaseError(paths, "", `${JSON.stringify(v1x)} ≠ ${JSON.stringify(v2x)}`);
        }
      }
      for (const prop of v1.properties) {
        if (optionalFields.indexOf(prop.key) > -1 && typeof v2[prop.key] === "undefined") continue;
        await compareValue(paths.concat([prop.key]), ctx, prop.value, v2[prop.key]);
      }
    } else if (v1.type === "Array") {
      if (!existAnno(paths, v1, "partial", "array")) {
        if (v1.elements.length !== v2.length) {
          throw new RunCaseError(paths, "", `size ${v1.elements.length} ≠ ${v2.length}`);
        }
      }
      for (const [i, ele] of v1.elements.entries()) {
        await compareValue(paths.concat([String(i)]), ctx, ele, v2[i]);
      }
    }
  }
}
