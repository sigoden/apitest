const cp = require("child_process");
const path = require("path");
const fixturesDir = path.resolve(__dirname, "./fixtures");

function spwanTest(target, args = []) {
  const child = cp.spawn("node", [path.resolve(__dirname, "../dist/bin.js"), "--no-color", ...args, path.resolve(fixturesDir, target)]);
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
