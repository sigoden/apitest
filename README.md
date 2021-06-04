# Apitest

[![build](https://github.com/sigoden/apitest/actions/workflows/ci.yaml/badge.svg?branch=master)](https://github.com/sigoden/apitest/actions/workflows/ci.yaml)
[![release](https://img.shields.io/github/v/release/sigoden/apitest)](https://github.com/sigoden/apitest/releases)
[![npm](https://img.shields.io/npm/v/@sigodenjs/apitest)](https://www.npmjs.com/package/@sigodenjs/apitest)

Apitest is a declarative api testing tool.

Read this in other languages: [中文](./README.zh-CN.md)

- [Apitest](#apitest)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Features](#features)
    - [JSON-like DSL](#json-like-dsl)
    - [Cross Platform, Programming Language Agnostic](#cross-platform-programming-language-agnostic)
    - [Mock](#mock)
    - [Data Is Assertion](#data-is-assertion)
    - [Data Is Variable](#data-is-variable)
    - [Mixin](#mixin)
    - [CI Support](#ci-support)
    - [TDD Support](#tdd-support)
    - [User-defined Functions](#user-defined-functions)
  - [Annotation](#annotation)
    - [Entrypoint Annotation](#entrypoint-annotation)
    - [Test Case Annotation](#test-case-annotation)
  - [Client](#client)
    - [Echo](#echo)
    - [Http](#http)
  - [CLI](#cli)
    - [Multiple Test Environments](#multiple-test-environments)
    - [Normal Mode](#normal-mode)
    - [CI Mode](#ci-mode)

## Introduction

```
apitest examples/realworld

module main
  prepare ✔
module auth
  Register (0.869) ✔
  Login (0.644) ✔
  Current User (0.578) ✔
  Update User (0.598) ✔
module article1
  All Articles (0.762) ✔
  Articles by Author (0.507) ✔
  Articles Favorited by Username (0.490) ✔
  Articles by Tag (0.832) ✔
module article2
  Create Article (0.625) ✔
  Feed (0.591) ✔
  All Articles with auth (1.193) ✔
  Articles by Author with auth (0.573) ✔
  Articles Favorited by Username with auth (0.569) ✔
  Single Article by slug (0.623) ✔
  Articles by Tag (0.879) ✔
  Update Article (0.739) ✔
  Favorite Article (0.619) ✔
  Unfavorite Article (0.617) ✔
  Create Comment for Article (0.618) ✔
  All Comments for Article (0.594) ✔
  All Comments for Article without auth (0.616) ✔
  Delete Comment for Article (0.602) ✔
  Delete Article (0.635) ✔
module profile
  Register Celeb (0.659) ✔
  Profile (0.552) ✔
  Follow Profile (0.606) ✔
  Unfollow Profile (0.526) ✘
module tag
  All Tags (1.561) ✔

1. Unfollow Profile(profile.unfollowProfile)
   profile.unfollowProfile.res.body.profile.following: true ≠ false
```

Apites will execute the test cases in sequence and print the test results.

## Installation

 Binaries are available in [releases](https://github.com/sigoden/apitest/releases). Make sure to put the path to the binary into your `PATH`.

 If you use `node`, you can install it by running `npm install -g @sigodenjs/apitest`

## Features

### JSON-like DSL

The test case itself can be used as an auxiliary reference document for the api.

```
{
    test1: { @describe("user login")
        req: {
            url: 'http://localhost:3000/login'
            method: 'post',
            body: {
                user: 'jason',
                pass: 'a123456,
            }
        },
        res: {
            status: 200
            body: {
                user: 'jason',
                token: '', @type
                expireIn: 0, @type
            }
        }
    }
}
```

According to the above use case, I don't need to elaborate, an experienced backend should be able to guess what parameters are passed by this api and what data is returned by the server.

The working principle of Apitest is to construct the request according to the description in the `req` part and send it to the backend. After receiving the response data from the backend, verify the data according to the description in the `res` part.

Please don't be scared by DSL. In fact, it is JSON, which loosens some grammatical restrictions (double quotes are not mandatory, comments are supported, etc.), and only one feature is added: comments. In the above example, `@describe`, `@type` is [Annotation](#Annotation).

> By the way, there is a vscode extension supports DSL (jsona) format.


### Cross Platform, Programming Language Agnostic

Apitest is a command line tool that supports linux, windows, mac systems. Its own test cases are written using DSL and do not rely on specific language experience.

### Mock

With Mock, no longer entangled in fabricating data

Apitest supports nearly 40 mock functions. For a detailed list, see [sigodne/fake.js](https://github.com/sigoden/fake-js#doc)

```
{
    test1: {
        req: {
            email: 'email', @mock
            username: 'username', @mock
            integer: 'integer(-5, 5)', @mock
            image: 'image("200x100")', @mock
            string: 'string("alpha", 5)', @mock
            date: 'date', @mock  // iso8601 format // 2021-06-03T07:35:55Z
            date1: 'date("yyyy-mm-dd HH:MM:ss")' @mock // 2021-06-03 15:35:55
            date2: 'date("unix")', @mock // unix epoch 1622705755
            date3: 'date("","3 hours 15 minutes")', @mock 
            date4: 'date("","2 weeks ago")', @mock 
            ipv6: 'ipv6', @mock
            sentence: 'sentence', @mock
            cnsentence: 'cnsentence', @mock 
        }
    }
}
```

> Apitest uses its own mock library (refer to mock.js), and mock functions can be added freely. If you have any mocks you want, please submit an issue.

### Data Is Assertion

How to understand? See below.

```json
{
    "foo1": 3,
    "foo2": ["a", "b"],
    "foo3": {
        "a": 3,
        "b": 4
    }
}
```

Assuming that the response data is as above, the test case is as follows:

```
{
    test1: {
        req: {
        },
        res: {
            body: {
                "foo1": 3,
                "foo2": ["a", "b"],
                "foo3": {
                    "a": 3,
                    "b": 4
                }
            }
        }
    }
}
```

That's right, it's exactly the same. Apitest will compare each part of the data one by one. Any inconsistency will cause the test to fail.

The strategy provided by conventional testing tools is addition. This is very important and I just add an assertion. In Apitest, you can only do subtraction. This data is not concerned. I actively ignore or relax the verification.

For example, the previous test case

```
{
    test1: { @describe("user login")
        ...
        res: {
            body: {
                user: 'jason',
                token: '', @type
                expireIn: 0, @type
            }
        }
    }
}
```

We still checked all the fields. Because the values of `token` and `expireIn` are changed, we use `@type` to tell Apitest to only check the type of the field and ignore the specific value.

### Data Is Variable

The following test cases can use all the data of the previous test cases.

```
{
    test1: { @describe("user login")
        ...
        res: {
            body: {
                token: '', @type
            }
        }
    },
    test2: { @describe("create article")
        req: {
            header: {
                authorization: `"Bearer " + test1.res.body.token`, @eval // We access the response data of the previous test case test1.
            },
        }
    },
    test3: {  @client('echo')
        req: {
            foo: "env.FOO", @eval // Use environment variables
        }
    }
}
```

### Mixin 

Use Mixin skillfully, get rid of copy and paste.

Generally, an api will not be used by only one test case. We can extract the routing into the mixin to avoid the need to replicate the routing information for each test case.

```
{
    createPost: { // Extract routing information to mixin
        req: {
            url: '/posts',
            method: 'post',
        },
    },
    auth1: { // Extract authorization
        req: {
            header: {
                authorization: `"Bearer " + test1.res.body.token`, @eval
            }
        }
    }
}
```

```
{
    createPost1: { @describe("create article 1") @mixin(["createPost", "auth1"])
        req: {
            body: {
                title: "sentence", @mock
            }
        }
    },
    createPost2: { @describe("create article 2，with description") @mixin(["createPost", "auth1"])
        req: {
            body: {
                title: "sentence", @mock
                description: "paragraph", @mock
            }
        }
    },
}
```

### CI Support

As a command line tool itself, it is very easy to integrate with the back-end ci. And apitest also provides the `--ci` option to optimize ci.

### TDD Support

You can even write only the `req` part, and after the api has a response, paste the response data directly as the `res` part. Talk of experience 🐶

In the default mode (not ci), when Apitest encounters a failed test, it will print an error and exit. Apitest has cached test data. You can repeatedly execute wrong test cases, develop and test at the same time, and then enter the follow-up test until you get through.

At the same time, you can also select a test case to execute through the `--only` option.

### User-defined Functions

You don't need to use this function at all. But I still worry about the need in certain extreme or corner scenes, so I still support it.

Apitest allows users to write custom functions through js to construct request data or verify response data. (Dare to call it a cross-programming language? 🐶)

Write functions `lib.js`

```js
// Make random color e.g. #34FFFF
function randColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Detect date in ISO8601(e.g. 2021-06-02:00:00.000Z) format
function isDate(date) {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(date)
}
```

Use functions

```
@jslib("lib") // Import js files

{
     test1: {
         req: {
             body: {
                 color:'makeColor()', @eval // call the `randColor` function to generate random colors
             }
         },
         res: {
             body: {
                 createdAt:'isDate($)', @eval // $ indicates the field to be verified, corresponding to the response data `res.body.createdAt`

                 // Of course you can use regex directly
                 updatedAt: `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/ .test($)`, @eval
             }
         }
     }
}
```

## Annotation

Apitest uses JSONA format to describe test cases.

JSONA is actually JSON. Some grammatical restrictions are loosened (double quotes are not mandatory, comments are supported, etc.), and a feature is added: annotations. That is, JSONA = JSON + Annotation.

JSON describes data and annotation describes logic.

### Entrypoint Annotation

- @module:  import submodules
- @jslib: import user-defined function files
- @mixin: import mixin files
- @client: configure the clients

```
{
    @client({
        name: "apiv1",
        kind: "http",
        options: {
            baseURL: "http://localhost:3000/apiv1",
            timeout: 30000,
        }
    })
    @module("auth")
    @jslib("lib")
    @mixin("mixin")
}
```

### Test Case Annotation

- @mixin: import mixins
- @client: pick client
- @group:  mark as case group

- @eval: uses js expr to generate data (in `req`) and verify data(in `res`)
- @mock: Use mock function to generate data

- @every: A set of assertions are passed before the test passes
- @some: If one of a set of assertions passes, the test passes
- @parital: mark only partial verification instead of congruent verification
- @type: mark only verifies the type of data

```
{
    group1 {@group // Use @group to mark the test case group
        test1: {@client("echo") @mixin(["createPost","auth1"])
            req: {
                v1: "Date.now()", @eval
                v2: "string(8)", @mock
                v3: "integer(2,6)", @mock
                v4: "integer(2,6)", @mock
                v5: {
                    a: 3,
                    b: 4,
                },
                v6: [
                    3.
                    4,
                ]
            },
            res: {
                v1: 0, @type // Using @type, we only verify that the `v1` value is an integer type, regardless of its specific value.
                v2: "$.length === 8", @eval
                v3: [ @every
                    "$> 3", @eval
                    "$> 4", @eval
                ],
                v4: [ @some
                    "$> 2", @eval
                    "$ <= 2", @eval
                ],
                v5: { @partial // Using @partial, we only verify the part of the object we are interested in `a`, ignore `b`
                    a: 3,
                },
                v6: [ @partial // Using @partial, we only check the first element in the array
                    3
                ]
            }
        }
    }
}
```

## Client

The `req` and `res` data structure of the test case is defined by the client

The client is responsible for constructing a request according to `req`, sending it to the server, receiving the response from the server, and constructing `res` response data.

If the test case does not use the `@client` annotation to specify a client, the client is the default.

If there is no default client defined in the entry file. Apitest will automatically insert `@client({name:"default",kind:"http"})` with `http` as the default client

Apitest provides two kinds of clients.

### Echo

The `echo` client does not send any request, and directly returns the data in the `req` part as the `res` data.

```
{
     test1: {@client("echo")
         req: {// Just fill in any data
         },
         res: {// equal to req
         }
     }
}
```

### Http

The `http` client handles http/https requests/responses.

```
{
    test1: { @client({options:{timeout: 10000}}) // Custom client parameters
        req: {
            url: "https://httpbin.org/anything/{id}", // request url
            method: "post", // http method
            query: { // query string, will append to url like `?foo=v1&bar=v2
                foo: "v1",
                bar: "v2",
            },
            params: {
                id: 33, // url path params, will fill the placefolder in path `/anything/{id}` => `/anything/33`
            },
            header: { // http request headers
                'x-key': 'v1'
            },
            body: { // request body
            }
        },
        res: {
            status: 200, // http status code
            header: { // http response headers
                "X-Amzn-Trace-Id": "Root=1-60b59dd1-1a896caf5291bbae089ffe26"
            },
            body: { // response body

            }
        }
    }
}
```

`http` client options

```js
{
    // `baseURL` will be prepended to `url` unless `url` is absolute.
    // It can be convenient to set `baseURL` for an instance of axios to pass relative URLs
    // to methods of that instance.
    baseURL: 'https://some-domain.com/api/',
    // `timeout` specifies the number of milliseconds before the request times out.
    // If the request takes longer than `timeout`, the request will be aborted.
    timeout: 1000, // default is `0` (no timeout)
    // `withCredentials` indicates whether or not cross-site Access-Control requests
    // should be made using credentials
    withCredentials: false, // default
}
```

## CLI

```
usage: apitest [options] [target]

Options:
  -h, --help     Show help                                             [boolean]
  -V, --version  Show version number                                   [boolean]
      --ci       Whether to run in ci mode                             [boolean]
      --reset    Whether to continue with last case                    [boolean]
      --dry-run  Check syntax then print all cases                     [boolean]
      --env      Specific test enviroment like prod, dev                [string]
      --only     Run specific module/case                               [string]
```

### Multiple Test Environments

Apitest supports multiple test environments, which can be specified by the `--env` option.

```
// Pre-release environment main.jsona
{
     @client({
         options: {
             url: "http://pre.example.com/api"
         }
     })
     @module("mod1")
}
```

```
// Local environment main.local.jsona
{
     @client({
         options: {
             url: "http://localhost:3000/api"
         }
     })
     @module("mod1")
     @module("mod2") // Only local test module
}
```

```sh
# By default, tests/main.local.jsona is selected
apitest tests
# Select tests/main.local.jsona
apitest tests --env local
```

Apitest allows to specify main.jsona
```sh
apitest tests/main.jsona
apitest tests/main.local.jsona
```

Specify a specific main.jsona, you can still use the `--env` option
```sh
# Select tests/main.local.jsona
apitest tests/main.jsona --env local
```

### Normal Mode

- Start execution from the last failed test case, print error details and exit when encountering a failed test case
- If there is option `--reset`, it will start from the beginning instead of where it failed last time
- If there is the option `--only mod1.test1`, only the selected test case will be executed

### CI Mode

- Ignore the cache and execute the test case from scratch
- Continue to execute the failed test case
- After all test cases are executed, errors will be printed uniformly

