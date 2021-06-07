import { Unit } from "./Cases";
import { JsonaString, JsonaValue } from "jsona-js";
import * as fs from "fs/promises";
import * as fake from "@sigodenjs/fake/lib/exec";
import * as path from "path";
import "@sigodenjs/fake/lib/cn";
import * as _ from "lodash";
import { VmContext } from "./Session";
import { RunCaseError } from "./Reporter";
import { existAnno, evalValue } from "./utils";

export default async function createReq(unit: Unit, ctx: VmContext) {
  const nextPaths = unit.paths.concat(["req"]);
  return createValue(nextPaths, ctx, unit.req);
}

async function createValue(paths: string[], ctx: VmContext, jsa: JsonaValue) {
  let result: any;
  if (existAnno(paths, jsa, "eval", "string")) {
    const value = evalValue(paths, ctx, (jsa as JsonaString).value);
    _.set(ctx.state, paths, value);
    result = value;
  } else if (existAnno(paths, jsa, "file", "string")) {
    const value = (jsa as JsonaString).value;
    const fileAnno = jsa.annotations.find(v => v.name === "file");
    try {
      const fileData = await fs.readFile(path.resolve(ctx.workDir, value), fileAnno.value);
      _.set(ctx.state, paths, fileData);
      result = fileData;
    } catch (err) {
      throw new RunCaseError(paths, "file", "cannot read file");
    }
  } else if(existAnno(paths, jsa, "mock", "string")) {
    const value = (jsa as JsonaString).value;
    try {
      const mockValue = fake(value);
      _.set(ctx.state, paths, mockValue);
      result = mockValue;
    } catch(err) {
      throw new RunCaseError(paths, "mock", `bad mock '${value}'`);
    }
  } else {
    if (jsa.type === "Array") {
      _.set(ctx.state, paths, _.get(ctx.state, paths, []));
      const output = _.get(ctx.state, paths);
      for (const [i, ele] of jsa.elements.entries()) {
        output.push(await createValue(paths.concat([String(i)]), ctx, ele));
      }
      result = output;
    } else if (jsa.type === "Object") {
      _.set(ctx.state, paths, _.get(ctx.state, paths, {}));
      const output = _.get(ctx.state, paths);
      for (const prop of jsa.properties) {
        output[prop.key] = await createValue(paths.concat([prop.key]), ctx, prop.value);
      }
      result = output;
    } else if (jsa.type === "Null") {
      result = null;
    } else {
      result = jsa.value;
    }
  }
  if (existAnno(paths, jsa, "trans", "any")) {
    const transAnno = jsa.annotations.find(v => v.name === "trans");
    _.set(ctx.state, "$", result);
    const value = evalValue(paths, ctx, transAnno.value, "trans");
    _.set(ctx.state, "$", null);
    _.set(ctx.state, paths, value);
    result = value;
  }
  return result;
}
