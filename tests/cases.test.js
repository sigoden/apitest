const { spwanTest } = require("./utils");

describe("cases", () => {
  test("describe-default", async () => {
    const { code, stdout } = await spwanTest("cases/describe-default.jsona", ["--ci"]);
    expect(code).toEqual(0);
    expect(stdout).toMatchSnapshot();
  });
  test("describe", async () => {
    const { code, stdout } = await spwanTest("cases/describe.jsona", ["--ci"]);
    expect(code).toEqual(0);
    expect(stdout).toMatchSnapshot();
  });
  test("group", async () => {
    const { code } = await spwanTest("cases/group.jsona", ["--ci"]);
    expect(code).toEqual(0);
  });
  test("invalid group value type", async () => {
    const { stdout, code } = await spwanTest("cases/invalid-group-value-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid mixin type", async () => {
    const { stdout, code } = await spwanTest("cases/invalid-mixin-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid prop key", async () => {
    const { stdout, code } = await spwanTest("cases/invalid-prop-key.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid run options", async () => {
    const { stdout, code } = await spwanTest("cases/invalid-run-options.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid run type", async () => {
    const { stdout, code } = await spwanTest("cases/invalid-run-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid unit client type", async () => {
    const { stdout, code } = await spwanTest("cases/invalid-unit-client-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid unit mixin type", async () => {
    const { stdout, code } = await spwanTest("cases/invalid-unit-mixin-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid unit mixin", async () => {
    const { stdout, code } = await spwanTest("cases/invalid-unit-mixin.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid unit value type", async () => {
    const { stdout, code } = await spwanTest("cases/invalid-unit-value-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("main", async () => {
    const { code } = await spwanTest("cases", ["--ci"]);
    expect(code).toEqual(0);
  }, 30000);
  test("merge mixin", async () => {
    const { stdout, code } = await spwanTest("cases/merge-mixin.jsona", ["--ci"]);
    expect(code).toEqual(0);
    expect(stdout).toMatchSnapshot();
  });
  test("run group", async () => {
    const { stdout, code } = await spwanTest("cases/run.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("run", async () => {
    const { stdout, code } = await spwanTest("cases/run-group.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("run --reset", async () => {
    const { stdout, code } = await spwanTest("cases/run.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
});
