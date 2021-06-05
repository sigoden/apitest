const { spwanTest } = require("./utils");

describe("cli", () => {
  test("with options --reset", async () => {
    const { stdout, code } = await spwanTest("cli/main.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("start from last failed", async () => {
    const { stdout, code } = await spwanTest("cli/main.jsona");
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("with options --ci", async () => {
    const { stdout, code } = await spwanTest("cli/main.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("start from first", async () => {
    const { stdout, code } = await spwanTest("cli/main.jsona");
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("with options --only", async () => {
    const { stdout, code } = await spwanTest("cli/main.jsona", ["--only", "main.test4"]);
    expect(code).toEqual(0);
    expect(stdout).toMatchSnapshot();
  });
  test("with options --only 2", async () => {
    const { stdout, code } = await spwanTest("cli/main.jsona", ["--only", "mod1"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("still start from last failed", async () => {
    const { stdout, code } = await spwanTest("cli/main.jsona");
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("with options --dry-run", async () => {
    const { stdout, code } = await spwanTest("cli/main.jsona", ["--dry-run"]);
    expect(code).toEqual(0);
    expect(stdout).toMatchSnapshot();
  });
  test("with options --env", async () => {
    const { stdout, code } = await spwanTest("cli/main.jsona", ["--env", "local", "--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("target folder", async () => {
    const { stdout, code } = await spwanTest("cli", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("target folder with options --env", async () => {
    const { stdout, code } = await spwanTest("cli", ["--env", "local", "--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("run group", async () => {
    const { stdout, code } = await spwanTest("cases/run-group.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("restart failed run group", async () => {
    const { stdout, code } = await spwanTest("cases/run-group.jsona", []);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
});
