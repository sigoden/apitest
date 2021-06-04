const cp = require("child_process");
const path = require("path");
const fixturesDir = path.resolve(__dirname, "./fixtures");

function spwanTest(target, args = [], envs = {}) {
  const child = cp.spawn(
    "node", 
    [path.resolve(__dirname, "../dist/bin.js"), ...args, path.resolve(fixturesDir, target)],
    {
      env: { ...process.env, "FORCE_COLOR": 0, ...envs },
    }
  );
  let stdout = "";
  let stderr = "";
  return new Promise(resolve => {
    child.stdout.on("data", data => {
      stdout += data.toString();
    });
    child.stderr.on("data", data => {
      stderr += data.toString();
    });
    child.on("exit", code => {
      resolve({ code, stdout, stderr });
    });
  });
}

exports.spwanTest = spwanTest;
