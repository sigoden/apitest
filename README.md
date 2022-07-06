# Apitest

[![build](https://github.com/sigoden/apitest/actions/workflows/ci.yaml/badge.svg?branch=master)](https://github.com/sigoden/apitest/actions/workflows/ci.yaml)
[![release](https://img.shields.io/github/v/release/sigoden/apitest)](https://github.com/sigoden/apitest/releases)
[![npm](https://img.shields.io/npm/v/@sigodenjs/apitest)](https://www.npmjs.com/package/@sigodenjs/apitest)

Apitest is declarative api testing tool with JSON-like DSL.

Read this in other languages: [中文](./README.zh-CN.md)

- [Apitest](#apitest)
  - [Installation](#installation)
  - [Get Started](#get-started)
  - [Features](#features)
    - [JSONA DSL](#jsona-dsl)
    - [Data Is Assertion](#data-is-assertion)
    - [Data Is Accessable](#data-is-accessable)
    - [Support Mock](#support-mock)
    - [Support Mixin](#support-mixin)
    - [CI Support](#ci-support)
    - [TDD Support](#tdd-support)
    - [User-defiend Functions](#user-defiend-functions)
    - [Skip, Delay, Retry & Loop](#skip-delay-retry--loop)
    - [Form, File Upload, GraphQL](#form-file-upload-graphql)
  - [Annotation](#annotation)
    - [@module](#module)
    - [@jslib](#jslib)
    - [@mixin](#mixin)
    - [@client](#client)
    - [@describe](#describe)
    - [@group](#group)
    - [@eval](#eval)
    - [@mock](#mock)
    - [@file](#file)
    - [@trans](#trans)
    - [@every](#every)
    - [@some](#some)
    - [@partial](#partial)
    - [@type](#type)
    - [@optional](#optional)
    - [@nullable](#nullable)
  - [Run](#run)
    - [Skip](#skip)
    - [Delay](#delay)
    - [Retry](#retry)
    - [Loop](#loop)
    - [Dump](#dump)
  - [Client](#client-1)
    - [Echo](#echo)
    - [Http](#http)
      - [Options](#options)
      - [Cookies](#cookies)
      - [x-www-form-urlencoded](#x-www-form-urlencoded)
      - [multipart/form-data](#multipartform-data)
      - [graphql](#graphql)
  - [Cli](#cli)
    - [Multiple Test Environments](#multiple-test-environments)
    - [Normal Mode](#normal-mode)
    - [CI Mode](#ci-mode)

## Installation

Binaries are available in [Github Releases](https://github.com/sigoden/apitest/releases). Make sure to put the path to the binary into your `PATH`.

```
# linux
curl -L -o apitest https://github.com/sigoden/apitest/releases/latest/download/apitest-linux 
chmod +x apitest
sudo mv apitest /usr/local/bin/

# macos
curl -L -o apitest https://github.com/sigoden/apitest/releases/latest/download/apitest-macos
chmod +x apitest
sudo mv apitest /usr/local/bin/

# npm
npm install -g @sigodenjs/apitest
```

## Get Started

Write test file `httpbin.jsona`

```
{
  test1: {
    req: {
      url: "https://httpbin.org/post",
      method: "post",
      headers: {
        'content-type':'application/json',
      },
      body: {
        v1: "bar1",
        v2: "Bar2",
      },
    },
    res: {
      status: 200,
      body: { @partial
        json: {
          v1: "bar1",
          v2: "bar2"
        }
      }
    }
  }
}

```

Run test

```
apitest httpbin.jsona

main
   test1 (0.944) ✘
   main.test1.res.body.json.v2: bar2 ≠ Bar2

   ...
```

The use case test failed. From the error message printed by Apitest, you can see that the actual value of `main.test1.res.body.json.v2` is `Bar2` instead of `bar2`.

After we modify `bar2` to `Bar2`, execute Apitest again

```
apitest httpbin.jsona

main
   test1 (0.930) ✔
```

## Features

### JSONA DSL

Use JSON-like DSL to write tests. The document is the test.

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

Click [jsona/spec](https://github.com/jsona/spec) to view the JSONA specification

> By the way, there is a vscode extension supports DSL (jsona) format.

Why use JSONA?

The essence of api testing is to construct and send `req` data, and receive and verify `res` data. Data is both the main body and the core, and JSON is the most readable and universal data description format.
Api testing also requires some specific logic. For example, a random number is constructed in the request, and only part of the data given in the response is checked.

JSONA = JSON + Annotation. JSON is responsible for the data part, and annotations are responsible for the logic part. Perfectly fit the interface test requirements.

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

### Data Is Accessable

Any data of the test case can be testd by subsequent test cases

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
      headers: {
        // We access the response data of the previous test case test1.
        authorization: `"Bearer " + test1.res.body.token`, @eval
      },
    }
  },
}
```

### Support Mock

With Mock, no longer entangled in fabricating data, Seee [@mock](#mock)


### Support Mixin 

Use Mixin skillfully, get rid of copy and paste. See [@mixin](#mixin)


### CI Support

As a command line tool itself, it is very easy to integrate with the back-end ci. And apitest also provides the `--ci` option to optimize ci.

### TDD Support

You can even write only the `req` part, and after the api has a response, paste the response data directly as the `res` part. Talk of experience 🐶

In the default mode (not ci), when Apitest encounters a failed test, it will print an error and exit. Apitest has cached test data. You can repeatedly execute wrong test cases, develop and test at the same time, and then enter the follow-up test until you get through.

At the same time, you can also select a test case to execute through the `--only` option.

### User-defiend Functions

You don't need to use this function at all. But I still worry about the need in certain extreme or corner scenes, so I still support it.

Apitest allows users to write custom functions through js to construct request data or verify response data. (Dare to call it a cross-programming language? 🐶), See [@jslib](#jslib)

### Skip, Delay, Retry & Loop

See [#Run](#run)

### Form, File Upload, GraphQL
See [#Http](#http)

## Annotation

Apitest uses JSONA format to describe test cases.

JSON describes data and annotation describes logic.

### @module

**Import submodule**
> scope: entrypoint file

```
// main.jsona
{
  @module("mod1")
}

// mod1.jsona
{
  test1: {
    req: {
    }
  }
}
```

### @jslib

**Import user-defined functions**
> scope: entrypoint file

Write functions `lib.js`

```js
// Make random color e.g. #34FFFF
exports.makeColor = function () {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Detect date in ISO8601(e.g. 2021-06-02:00:00.000Z) format
exports.isDate = function (date) {
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
        // call the `makeColor` function to generate random colors
        color:'makeColor()', @eval 
       }
     },
     res: {
       body: {
        // $ indicates the field to be verified, here is `res.body.createdAt`
        createdAt:'isDate($)', @eval

        // Of course you can use regex directly
        updatedAt: `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/ .test($)`, @eval
       }
     }
   }
}
```

### @mixin

**Import mixin file**
> scope: entrypoint file, group/unit head

First create a file to store the file defined by Mixin
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
      headers: {
        authorization: `"Bearer " + test1.res.body.token`, @eval
      }
    }
  }
}
```

```
@mixin("mixin") // include mixin.jsona
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

The more frequently used part, the more suitable it is to be extracted to Mixin.

### @client


**Setup clients**
> scope: entrypoint file, group/unit head

[Client](#client) is responsible for constructing a request according to `req`, sending it to the server, receiving the response from the server, and constructing `res` response data.

```
{
  @client({
    name: "apiv1",
    kind: "http",
    options: {
      baseURL: "http://localhost:3000/api/v1",
      timeout: 30000,
    }
  })
  @client({
    name: "apiv2",
    kind: "http",
    options: {
      baseURL: "http://localhost:3000/api/v2",
      timeout: 30000,
    }
  })
  test1: { @client("apiv1") 
    req: {
      url: "/posts" // 使用apiv1客户端，所以请求路径是  http://localhost:3000/api/v1/posts
    }
  },
  test2: { @client({name:"apiv2",options:{timeout:30000}})
    req: {
      url: "/key" // 使用apiv2客户端，所以请求路径是 http://localhost:3000/api/v2/posts
    }
  },
}
```

### @describe


**Give a title**
> scope: module file, group/unit head

```
{
  @client({name:"default",kind:"echo"})
  @describe("This is a module")
  group1: { @group @describe("This is a group")
    test1: { @describe("A unit in group")
      req: {
      }
    },
    group2: { @group @describe("This is a nested group")
      test1: { @describe("A unit in nested group")
        req: {
        }
      }
    }
  }
}
```

It will be printed as follows

```
This is a module
  This is a group
    A unit in group ✔
    This is a nested group
      A unit in nested group ✔
```

If the `@description` is removed, it will be printed as follows

```
main
  group1
    test1 ✔
    group2
      test1 ✔
```

### @group

**Mark as case group**
> scope: group head

The test cases in the group will inherit the group's `@client` and `@mixin`. The group also supports [Run](#run).


```
{
  group1: { @group @mixin("auth1") @client("apiv1")
    test1: {

    },
    // The mixin of the use case and the mixin of the group will be merged into @mixin(["route1","auth1"])
    test2: { @mixin("route1") 

    },
    // The client of the use case will overwrite the client of the group
    test3: { @client("echo") 

    },
    group2: { @group // nest group

    },
    run: {

    }
  }
}
```

### @eval

**Use js expr to generate data (in `req`) and verify data(in `res`)**
> scope: unit block

`@eval` features:

- can use js builtin functions
- can use jslib functions
- can access environment variables
- can use the data from the previous test

```
{
  test1: { @client("echo")
    req: {
      v1: "JSON.stringify({a:3,b:4})", @eval // Use JS built-in functions
      v2: `
        let x = 3;
        let y = 4;
        x + y
        `, @eval  // Support code block
      v3: "env.FOO", @eval // Access environment variables
      v4: 'mod1.test1.res.body.id`, @eval // Access the data of the previous test
    }
  }
}

```

`@eval` in `res` part with additional features:

- `$` repersent response data in the position
- return value true means that the verification passed
- if the return value is not of type bool, the return value and the response data will be checked for congruent matching

```
{
  rest2: {
    res: {
      v1: "JSON.parse($).a === 3",  @eval // $ is `res.v1`
      v2: "true", @eval // true force test passed
      v4: 'mod1.test1.res.body.id`, @eval // return value congruent matching
    }
  }
}
```

**`@eval` accessing use case data with elision**

```
{
  test1: {
    req: {
      v1: 3,
    },
    res: {
      v1: "main.test1.req.v1", @eval
   // v1:      "test1.req.v1", @eval
   // v1:            "req.v1", @eval
    }
  }
}
```

### @mock

**Use mock function to generate data**
> scope: unit req block

Apitest supports nearly 40 mock functions. For a detailed list, see [fake-js](https://github.com/sigoden/fake-js#doc)

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

### @file

**Use file**
> scope: unit req block

```
{
  test1: {
    req: {
      headers: {
        'content-type': 'multipart/form-data',
      },
      body: {
        field: 'my value',
        file: 'bar.jpg', @file // upload file `bar.jpg`
      }
    },
  }
}
```
### @trans

**Transform data**
> scope: unit block

```
{
  test1: { @client("echo")
    req: {
      v1: { @trans(`JSON.stringify($)`)
        v1: 1,
        v2: 2,
      }
    },
    res: {
      v1: `{"v1":1,"v2":2}`,
    }
  },
  test2: { @client("echo")
    req: {
      v1: `{"v1":1,"v2":2}`,
    },
    res: {
      v2: { @trans(`JSON.parse($)`)
        v1: 1,
        v2: 2,
      }
    }
  }
}
```

###  @every

**A set of assertions are passed before the test passes**
> scope: unit res block

```
{
  test1: { @client("echo")
    req: {
      v1: "integer(1, 10)", @mock
    },
    res: {
      v1: [ @every
        "$ > -1", @eval
        "$ > 0", @eval
      ]
    }
  }

}
```

### @some

**If one of a set of assertions passes, the test passes**
> scope: unit res block

```
{
  test1: { @client("echo")
    req: {
      v1: "integer(1, 10)", @mock
    },
    res: {
      v1: [ @some
        "$ > -1", @eval
        "$ > 10", @eval
      ]
    }
  }
}
```

### @partial

**Mark only partial verification instead of congruent verification**
> scope: unit res block

```
{
  test1: { @client("echo")
    req: {
      v1: 2,
      v2: "a",
    },
    res: { @partial
      v1: 2,
    }
  },
  test2: { @client("echo")
    req: {
      v1: [
        1,
        2
      ]
    },
    res: {
      v1: [ @partial
        1
      ]
    }
  }
}
```

### @type

**Mark only verifies the type of data**
> scope: unit res block

```
{
  test1: { @client("echo")
    req: {
      v1: null,
      v2: true,
      v3: "abc",
      v4: 12,
      v5: 12.3,
      v6: [1, 2],
      v7: {a:3,b:4},
    },
    res: {
      v1: null, @type
      v2: false, @type
      v3: "", @type
      v4: 0, @type
      v5: 0.0, @type
      v6: [], @type
      v7: {}, @type
    }
  },
}
```

### @optional

**Marker field is optional**
> scope: unit res block

```
{
  test1: { @client("echo")
    req: {
      v1: 3,
      // v2: 4, optional field
    },
    res: {
      v1: 3,
      v2: 4, @optional
    }
  }
}
```

### @nullable

**Field maybe null**
> scope: unit res block

```
{
  test1: { @client("echo")
    req: {
      v1: null,
      // v1: 3,
    },
    res: {
      v1: 3, @nullable
    }
  }
}
```


## Run

In some scenarios, use cases may not need to be executed, or they may need to be executed repeatedly. It is necessary to add a `run` option to support this feature.

### Skip

```
{
  test1: { @client("echo")
    req: {
    },
    run: {
      skip: `mod1.test1.res.status === 200`, @eval
    }
  }
}
```

- `run.skip` skip the test when true

### Delay

Run the test case after waiting for a period of time

```
{
  test1: { @client("echo")
    req: {
    },
    run: {
      delay: 1000,
    }
  }
}
```

- `run.delay` delay in ms

### Retry

```
{
  test1: { @client("echo")
    req: {
    },
    run: {
      retry: {
        stop:'$run.count > 2', @eval
        delay: 1000,
      }
    },
  }
}
```

variables:
- `$run.count` records the number of retries.

options:
- `run.retry.stop`  whether to stop retry
- `run.retry.delay` interval between each retry (ms)

### Loop

```
{
  test1: { @client("echo")
    req: {
      v1:'$run.index', @eval
      v2:'$run.item', @eval
    },
    run: {
      loop: {
        delay: 1000,
        items: [
          'a',
          'b',
          'c',
        ]
      }
    },
  }
}
```

variables:
- `$run.item` current loop data
- `$run.index` current loop data index

options:
- `run.loop.items` iter pass to `$run.item`
- `run.loop.delay`  interval between each cycle (ms)

### Dump

```
{
  test1: { @client("echo")
    req: {
    },
    run: {
      dump: true,
    }
  }
}
```

- `run.dump` force print req/res data when true


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

`http` client handles http/https requests/responses.

```
{
  test1: { @client({options:{timeout: 10000}}) // Custom client parameters
    req: {
      url: "https://httpbin.org/anything/{id}", // request url
      // http methods, `post`, `get`, `delete`, `put`, `patch`
      method: "post",
      query: { // ?foo=v1&bar=v2
        foo: "v1",
        bar: "v2",
      },

      // url path params, `/anything/{id}` => `/anything/33`
      params: {
        id: 33, 
      },
      headers: {
        'x-key': 'v1'
      },
      body: { // request body
      }
    },
    res: {
      status: 200,
      headers: {
        'x-key': 'v1'
      },
      body: { // response body

      }
    }
  }
}
```

#### Options

```js
{
  // `baseURL` will be prepended to `url` unless `url` is absolute.
  baseURL: '',
  // `timeout` specifies the number of milliseconds before the request times out.
  // If the request takes longer than `timeout`, the request will be aborted.
  timeout: 0,
  // `maxRedirects` defines the maximum number of redirects to follow in node.js. 
  // If set to 0, no redirects will be followed.
  maxRedirects: 0,
  // `headers` is default request headers
  headers: {
  },
  // `proxy` configures http(s) proxy, you can also use HTTP_PROXY, HTTPS_PROXY 
  // environment variables
  proxy: "http://user:pass@localhost:8080"
}
```

#### Cookies

```js
{
  test1: {
    req: {
      url: "https://httpbin.org/cookies/set",
      query: {
        k1: "v1",
        k2: "v2",
      },
    },
    res: {
      status: 302,
      headers: { @partial
        'set-cookie': [], @type
      },
      body: "", @type
    }
  },
  test2: {
    req: {
      url: "https://httpbin.org/cookies",
      headers: {
        Cookie: `test1.res.headers["set-cookie"]`, @eval
      }
    },
    res: {
      body: { @partial
        cookies: {
          k1: "v1",
          k2: "v2",
        }
      }
    },
  },
}
```

#### x-www-form-urlencoded 

Add the request header `"content-type": "application/x-www-form-urlencoded"`

```
{
  test2: { @describe('test form')
    req: {
      url: "https://httpbin.org/post",
      method: "post",
      headers: {
        'content-type':"application/x-www-form-urlencoded"
      },
      body: {
        v1: "bar1",
        v2: "Bar2",
      }
    },
    res: {
      status: 200,
      body: { @partial
        form: {
          v1: "bar1",
          v2: "Bar2",
        }
      }
    }
  },
}
```

#### multipart/form-data


Add the request header `"content-type": "multipart/form-data"`
Combined with `@file` annotation to implement file upload

```
{
  test3: { @describe('test multi-part')
    req: {
      url: "https://httpbin.org/post",
      method: "post",
      headers: {
        'content-type': "multipart/form-data",
      },
      body: {
        v1: "bar1",
        v2: "httpbin.jsona", @file
      }
    },
    res: {
      status: 200,
      body: { @partial
        form: {
          v1: "bar1",
          v2: "", @type
        }
      }
    }
  }
}
```

#### graphql

```
{
  vars: { @describe("share variables") @client("echo")
    req: {
      v1: 10,
    }
  },
  test1: { @describe("test graphql")
    req: {
      url: "https://api.spacex.land/graphql/",
      body: {
        query: `\`query {
  launchesPast(limit: ${vars.req.v1}) {
    mission_name
    launch_date_local
    launch_site {
      site_name_long
    }
  }
}\`` @eval
      }
    },
    res: {
      body: {
        data: {
          launchesPast: [ @partial
            {
              "mission_name": "", @type
              "launch_date_local": "", @type
              "launch_site": {
                "site_name_long": "", @type
              }
            }
          ]
        }
      }
    }
  }
}
```

## Cli

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
      --dump     Force print req/res data                              [boolean]
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

