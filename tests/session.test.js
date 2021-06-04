const { spwanTest } = require("./utils");

describe("session", () => {
  test("main", async () => {
    const { stdout, code } = await spwanTest("session", ["--ci"], {
      "FOO": "bar",
    });
    expect(code).toEqual(0);
    expect(stdout).toMatchSnapshot();
  });
});
