#!/usr/bin/env node

import Runner, { RunOptions } from "./Runner";
const pkg = require("../package.json");  // eslint-disable-line
const argv = require("yargs/yargs")(process.argv.slice(2)) // eslint-disable-line
  .usage("usage: $0 [options] [target]")
  .help("help").alias("help", "h")
  .version("version", pkg.version).alias("version", "V")
  .options({
    ci: {
      type: "boolean",
      describe: "Whether to run in ci mode",
    },
    reset: {
      type: "boolean",
      describe: "Whether to continue with last case",
    },
    "dry-run": {
      type: "boolean",
      describe: "Check syntax then print all cases",
    },
    env: {
      type: "string",
      describe: "Specific test enviroment like prod, dev",
    },
    only: {
      type: "string",
      describe: "Run specific module/case",
    },
  })
  .argv;

async function main(argv) {
  try {
    const target = argv["_"][0] || process.cwd();
    const runner = await Runner.create(target, argv.env);
    let runOptions: RunOptions;
    if (argv["dry-run"]) {
      runOptions = {
        dryRun: true,
        reset: true,
      };
    } else if (argv.only) {
      runOptions = {
        only: argv.only,
      };
    } else if (argv.ci) {
      runOptions = {
        ci: true,
        reset: true, 
      };
    } else {
      runOptions = {
        ci: false,
        dryRun: false,
        reset: argv.reset, 
      };
    }
    const exitCode = await runner.run(runOptions);
    process.exit(exitCode);
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
}

main(argv);
