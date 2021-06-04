const { spwanTest } = require("./utils");

describe("cases", () => {
  test("invalid prop key", async () => {
    const { stdout, code } = await spwanTest("cases/invalid-prop-key.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid unit value type", async () => {
    const { stdout, code } = await spwanTest("cases/invalid-unit-value-type.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid group value type", async () => {
    const { stdout, code } = await spwanTest("cases/invalid-unit-value-type.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("default-describe", async () => {
    const { stdout, code } = await spwanTest("cases/default-describe.jsona", ["--reset"]);
    expect(code).toEqual(0);
    expect(stdout).toMatchSnapshot();
  });
  test("merge mixin", async () => {
    const { stdout, code } = await spwanTest("cases/merge-mixin.jsona", ["--reset"]);
    expect(code).toEqual(0);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid mixin value type", async () => {
    const { stdout, code } = await spwanTest("cases/invalid-mixin-type.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid unit mixin", async () => {
    const { stdout, code } = await spwanTest("cases/invalid-unit-mixin.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid unit mixin type", async () => {
    const { stdout, code } = await spwanTest("cases/invalid-unit-mixin-type.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid unit client type", async () => {
    const { stdout, code } = await spwanTest("cases/invalid-unit-client-type.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("client", async () => {
    const { code } = await spwanTest("cases/client.jsona", ["--reset"]);
    expect(code).toEqual(0);
  });
});
