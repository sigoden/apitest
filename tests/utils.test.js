const { validate  } = require("../dist/utils");
const { CASE_RUN_SCHEMA  } = require("../dist/createRun");
test("validate", () => {
  expect(() => {
    validate(
      undefined,
      [], 
      CASE_RUN_SCHEMA, 
      false,
    );
  }).not.toThrow();
  expect(() => {
    validate(
      {
        skip: true,
        delay: 100,
        loop: {
          items: [1, 2],
          delay: 100,
        },
        retry: {
          stop: false,
          delay: 100,
        },
      },
      [], 
      CASE_RUN_SCHEMA, 
      false,
    );
  }).not.toThrow();

  expect(() => {
    validate(
      {
        skip: "abc",
      },
      [], 
      CASE_RUN_SCHEMA, 
      false,
    );
  }).toThrow();

  expect(() => {
    validate(
      {
        retry: {
          stop: "abc",
          delay: 100,
        },
      },
      [], 
      CASE_RUN_SCHEMA, 
      false,
    );
  }).toThrow();
  expect(() => {
    validate(
      {
        retry: {
          delay: 100,
        },
      },
      [], 
      CASE_RUN_SCHEMA, 
      false,
    );
  }).toThrow();
});
