const { spwanTest } = require("./utils");

describe("session", () => {
  test("session", async () => {
    const { stdout, code } = await spwanTest("session", ["--reset"], {
      "FOO": "bar",
    });
    expect(code).toEqual(0);
    expect(stdout).toMatchSnapshot();
  });
});
