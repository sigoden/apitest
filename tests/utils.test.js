const { schemaValidate  } = require("../dist/utils");
const { CASE_RUN_SCHEMA  } = require("../dist/createRun");
const { HTTP_OPTIONS_SCHEMA  } = require("../dist/Clients/HttpClient");
test("validate", () => {
  expect(() => {
    schemaValidate(
      undefined,
      [], 
      CASE_RUN_SCHEMA, 
      false,
    );
  }).not.toThrow();
  expect(() => {
    schemaValidate(
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
    schemaValidate(
      {
        skip: "abc",
      },
      [], 
      CASE_RUN_SCHEMA, 
      false,
    );
  }).toThrow();

  expect(() => {
    schemaValidate(
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
    schemaValidate(
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
  expect(() => {
    schemaValidate(
      {
        baseURL: "abc",
        timeout: 5000,
        withCredentials: false,
        headers: {
          "x-key": "abc",
        },
      },
      [], 
      HTTP_OPTIONS_SCHEMA, 
      true,
    );
  }).not.toThrow();
  expect(() => {
    schemaValidate(
      {
        headers: {
          "x-key": [],
        },
      },
      [], 
      HTTP_OPTIONS_SCHEMA, 
      true,
    );
  }).toThrow();
});
