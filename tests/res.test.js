const { spwanTest } = require("./utils");

describe("res", () => {
  test("data", async () => {
    const { stdout, code } = await spwanTest("res/data.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("eval", async () => {
    const { stdout, code } = await spwanTest("res/eval.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("every", async () => {
    const { stdout, code } = await spwanTest("res/every.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("partial", async () => {
    const { stdout, code } = await spwanTest("res/partial.jsona", ["--ci"]);
    expect(code).toEqual(0);
    expect(stdout).toMatchSnapshot();
  });
  test("some", async () => {
    const { stdout, code } = await spwanTest("res/some.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("trans", async () => {
    const { code } = await spwanTest("res/trans.jsona", ["--ci"]);
    expect(code).toEqual(0);
  });
  test("type", async () => {
    const { stdout, code } = await spwanTest("res/type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("optional", async () => {
    const { stdout, code } = await spwanTest("res/optional.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("nullable", async () => {
    const { stdout, code } = await spwanTest("res/nullable.jsona", ["--ci"]);
    expect(code).toEqual(0);
    expect(stdout).toMatchSnapshot();
  });
});
