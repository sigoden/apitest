const { spwanTest } = require("./utils");

describe("createReq", () => {
  test("general", async () => {
    const { stdout, code } = await spwanTest("createReq/test.jsona", ["--ci"]);
    expect(code).toEqual(0);
    expect(stdout).toMatchSnapshot();
  });
  test("eval", async () => {
    const { stdout, code } = await spwanTest("createReq/eval.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("mock", async () => {
    const { stdout, code } = await spwanTest("createReq/mock.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
});
