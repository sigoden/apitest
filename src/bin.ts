#!/usr/bin/env node

import Runner from "./Runner";

const pkg = require("../package.json");  // eslint-disable-line
const argv = require("yargs/yargs")(process.argv.slice(2)) // eslint-disable-line
  .describe("Declarative api test tool")
  .usage("Usage: $0 [options] [dir]")
  .help("help").alias("help", "h")
  .version("version", pkg.version).alias("version", "V")
  .options({
    ci: {
      boolean: true,
      describe: "Whether to run in ci mode",
    },
    reset: {
      boolean: true,
      describe: "Whether to continue with last case",
    },
    env: {
      describe: "Specific test enviroment like prod, dev",
    },
    only: {
      describe: "Run specific module/case",
    },
  })
  .positional("dir", {
    describe: "Apitest folder",
  })
  .argv;

async function main(argv) {
  try {
    const workDir = argv["_"][0] || process.cwd();
    const runner = await Runner.create(workDir, argv.env);
    if (argv.only) {
      await runner.runOnly(argv.only);
    } else if (argv.ci) {
      await runner.runCi();
    } else {
      await runner.run(argv.reset);
    }
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
}

main(argv);
