const { spwanTest } = require("./utils");

describe("loader", () => {
  test("target file not found", async () => {
    const { stdout, code } = await spwanTest("loader/notfound.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("target main not found", async () => {
    const { stdout, code } = await spwanTest("loader", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid jsona", async () => {
    const { stdout, code } = await spwanTest("loader/invalid-jsona.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid jsona value", async () => {
    const { stdout, code } = await spwanTest("loader/invalid-jsona-value.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid client", async () => {
    const { stdout, code } = await spwanTest("loader/invalid-client.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid mixin multiple", async () => {
    const { stdout, code } = await spwanTest("loader/invalid-mixin-multiple.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid mixin jsona", async () => {
    const { stdout, code } = await spwanTest("loader/invalid-mixin-jsona.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid mixin value", async () => {
    const { stdout, code } = await spwanTest("loader/invalid-mixin-value.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid mixin", async () => {
    const { stdout, code } = await spwanTest("loader/invalid-mixin.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid jslib js", async () => {
    const { stdout, code } = await spwanTest("loader/invalid-jslib-js.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid jslib js2", async () => {
    const { stdout, code } = await spwanTest("loader/invalid-jslib-js2.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid jslib", async () => {
    const { stdout, code } = await spwanTest("loader/invalid-jslib.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid module jsona", async () => {
    const { stdout, code } = await spwanTest("loader/invalid-module-jsona.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid module value", async () => {
    const { stdout, code } = await spwanTest("loader/invalid-module-value.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid module", async () => {
    const { stdout, code } = await spwanTest("loader/invalid-module.jsona", ["--reset"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
});
