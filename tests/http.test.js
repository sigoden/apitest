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
  test("invalid headers prop type", async () => {
    const { stdout, code } = await spwanTest("http/invalid-headers-prop-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid headers type", async () => {
    const { stdout, code } = await spwanTest("http/invalid-headers-type.jsona", ["--ci"]);
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
  test("invalid res headers prop type", async () => {
    const { stdout, code } = await spwanTest("http/invalid-res-headers-prop-type.jsona", ["--ci"]);
    expect(code).toEqual(1);
    expect(stdout).toMatchSnapshot();
  });
  test("invalid res headers type", async () => {
    const { stdout, code } = await spwanTest("http/invalid-res-headers-type.jsona", ["--ci"]);
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
});

describe("http trans", () => {
  test("no-check-trans", async () => {
    const { code } = await spwanTest("http/no-check-trans.jsona", ["--ci"]);
    expect(code).toEqual(0);
  }, 60000);
});

describe("http form", () => {
  test("form", async () => {
    const { code } = await spwanTest("http/form.jsona", ["--ci"]);
    expect(code).toEqual(0);
  }, 60000);
});

describe("http cookie", () => {
  test("cookie", async () => {
    const { code } = await spwanTest("http/cookie.jsona", ["--ci"]);
    expect(code).toEqual(0);
  }, 60000);
});
