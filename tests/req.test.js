const { spwanTest } = require("./utils");

describe("req", () => {
  test("eval", async () => {
    const { stdout, code } = await spwanTest("req/eval.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("file", async () => {
    const { stdout, code } = await spwanTest("req/file.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("main", async () => {
    const { stdout, code } = await spwanTest("req", ["--ci"]);
    expect(code).toEqual(0);
    expect(stdout).toMatchSnapshot();
  });
  test("mock", async () => {
    const { stdout, code } = await spwanTest("req/mock.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("trans", async () => {
    const { code } = await spwanTest("req/trans.jsona", ["--ci"]);
    expect(code).toEqual(0);
  });
});
