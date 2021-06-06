import * as _ from "lodash";
import { Case } from "./Cases";
import { JsonaString, JsonaValue } from "jsona-js";
import {  existAnno, evalValue, schemaValidate } from "./utils";
import { VmContext } from "./Session";
import { RunCaseError } from "./Reporter";

export interface CaseRun {
  skip?: boolean;
  delay?: number;
  dump?: boolean;
  retry?: {
    stop: boolean;
    delay: number;
  };
  loop?: {
    items: any[];
    delay: number;
  };
}

export const CASE_RUN_SCHEMA = {
  type: "object",
  properties: {
    skip: {
      type: "boolean",
    },
    delay: {
      type: "integer",
    },
    dump: {
      type: "boolean",
    },
    retry: {
      type: "object",
      properties: {
        stop: {
          type: "boolean",
        },
        delay: {
          type: "integer",
        },
      },
      required: ["stop", "delay"],
    },
    loop: {
      type: "object",
      properties: {
        items: {
          type: "array",
        },
        delay: {
          type: "integer",
        },
      },
      required: ["items", "delay"],
    },
  },
};

export default function createRun(testcase: Case, ctx: VmContext) {
  if (!testcase.run) return;
  const nextPaths = testcase.paths.concat(["run"]);
  const run: CaseRun = createValue(nextPaths, ctx, testcase.run);
  try {
    schemaValidate(run, nextPaths, CASE_RUN_SCHEMA, false);
  } catch (err) {
    if (err.paths) throw new RunCaseError(err.paths, "", err.message);
    throw new RunCaseError(nextPaths, "", "run is invalid");
  }
  return run;
}

function createValue(paths: string[], ctx: VmContext, jsa: JsonaValue) {
  if (existAnno(paths, jsa, "eval", "string")) {
    const value = evalValue(paths, ctx, (jsa as JsonaString).value);
    _.set(ctx.state, paths, value);
    return value;
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
