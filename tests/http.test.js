const { spwanTest } = require("./utils");

describe("http", () => {
  test("invaid params mismatch path", async () => {
    const { stdout, code } = await spwanTest("http/invaid-params-mismatch-path.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invaid params prop type", async () => {
    const { stdout, code } = await spwanTest("http/invaid-params-prop-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invaid params type", async () => {
    const { stdout, code } = await spwanTest("http/invaid-params-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid header prop type", async () => {
    const { stdout, code } = await spwanTest("http/invalid-header-prop-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid header type", async () => {
    const { stdout, code } = await spwanTest("http/invalid-header-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid method type", async () => {
    const { stdout, code } = await spwanTest("http/invalid-method-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid method value", async () => {
    const { stdout, code } = await spwanTest("http/invalid-method-value.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid params miss", async () => {
    const { stdout, code } = await spwanTest("http/invalid-params-miss.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid query prop type", async () => {
    const { stdout, code } = await spwanTest("http/invalid-query-prop-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid query type", async () => {
    const { stdout, code } = await spwanTest("http/invalid-query-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid req value", async () => {
    const { stdout, code } = await spwanTest("http/invalid-req-value.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid res header prop type", async () => {
    const { stdout, code } = await spwanTest("http/invalid-res-header-prop-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid res header type", async () => {
    const { stdout, code } = await spwanTest("http/invalid-res-header-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid res status type", async () => {
    const { stdout, code } = await spwanTest("http/invalid-res-status-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid res type", async () => {
    const { stdout, code } = await spwanTest("http/invalid-res-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid url miss", async () => {
    const { stdout, code } = await spwanTest("http/invalid-url-miss.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid url type", async () => {
    const { stdout, code } = await spwanTest("http/invalid-url-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("main", async () => {
    const { code } = await spwanTest("http", ["--ci"]);
    expect(code).toEqual(0);
  }, 60000);
  test("no-check-trans", async () => {
    const { code } = await spwanTest("http/no-check-trans.jsona", ["--ci"]);
    expect(code).toEqual(0);
  }, 60000);
});
