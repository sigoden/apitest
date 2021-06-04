const { spwanTest } = require("./utils");

describe("compareRes", () => {
  test("general", async () => {
    const { stdout, code } = await spwanTest("compareRes/test.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("eval", async () => {
    const { stdout, code } = await spwanTest("compareRes/eval.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("type", async () => {
    const { stdout, code } = await spwanTest("compareRes/type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("every", async () => {
    const { stdout, code } = await spwanTest("compareRes/every.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("some", async () => {
    const { stdout, code } = await spwanTest("compareRes/some.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("partial", async () => {
    const { stdout, code } = await spwanTest("compareRes/partial.jsona", ["--ci"]);
    expect(code).toEqual(0);
    expect(stdout).toMatchSnapshot();
  });
});
