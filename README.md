# ApiTest

**apitest** is a declartive api testing tool.

## Getting Started

There is an api described by curl
```sh
curl -X POST -H 'content-type:application/json' -d '{"foo1":"bar1","foo2":"Bar2"}' https://httpbin.org/post 
```
When run in terminal it will print
```json
{
  "args": {}, 
  "data": "{\"foo1\":\"bar1\",\"foo2\":\"Bar2\"}", 
  "files": {}, 
  "form": {}, 
  "headers": {
    "Accept": "*/*", 
    "Content-Length": "29", 
    "Content-Type": "application/json", 
    "Host": "httpbin.org", 
    "User-Agent": "curl/7.58.0", 
    "X-Amzn-Trace-Id": "Root=1-60b59dd1-1a896caf5291bbae089ffe26"
  }, 
  "json": {
    "foo1": "bar1", 
    "foo2": "Bar2"
  }, 
  "origin": "121.35.100.147", 
  "url": "https://httpbin.org/post"
}
```

How to test this api with `apitest`?

1. write `httbin.jsona` file
```js
{
  post: { @describe("httpbin post")
    req: {
      url: "https://httpbin.org/post",
      method: "post",
      header: {
        'content-type': 'application/json',
      },
      body: {
        foo1: "bar1",
        foo2: "Bar2",
      },
    },
    res: {
      status: 200,
      body: { @partial
        "args": {},
        "data": "{\"foo1\":\"bar1\",\"foo2\":\"Bar2\"}",
        "files": {},
        "form": {},
        "headers": {}, @type
        "json": {
          "foo1": "bar1",
          "foo2": "Bar2"
        },
        "origin": "", @type
        "url": "https://httpbin.org/post"
      }
    }
  }
}
```

Ignore annotation like `@describe`, `@partial`, `@type`, it just the plain json describe the request and response.

It is very easy to read and write.

2. run apitest

```
apitest httbin.jsona
```

apitest will print
```
module main
  httpbin post (0.992) ✔
```

If we change the `httpbin.jsona` and rerun
```diff
  post: { @describe("httpbin post")
    ...
    res: {
      status: 200,
      body: { @partial
        "args": {},
        "data": "{\"foo1\":\"bar1\",\"foo2\":\"Bar2\"}",
        "files": {},
        "form": {},
        "headers": {}, @type
        "json": {
          "foo1": "bar1",
-         "foo2": "Bar2"
+         "foo2": "bar2"
        },
        "origin": "", @type
        "url": "https://httpbin.org/post"
      }
    }
  }
}
```

apitest will print

```
module main
  httpbin post (1.018) ✘
  main.post.res.body.json.foo2: fail, bar2 ≠ Bar2

```
apitest detect value at `main.post.res.body.json.foo2` expect `bar2` but got `Bar2`, it is not equal. 
so the test is failed, then apitest print error.

## Installation

There are multiple ways to install apitest.

1.  **Binaries**
   Binaries are available for download [releases](https://github.com/sigoden/apitest/releases). Make sure to put the
   path to the binary into your `PATH`.

2. **From npm**
  ```
  npm i -g @sigodenjs/apitest
  ```

## Annotation

apitest use jsona to write tests. click [sigoden/jsona](https://github.com/sigoden/jsona) for more details.

Jsona = JSON + Annotation. JSON for data, annotation for logic. Annotation is like function.

There are four kinds of annotation.

### Main

exists in entrypoint/main jsona file

- [@client](./docs/client.md) define/config client
- [@mixin](./docs/mixin.md) define reusable parts
- [@module](./docs/module.md) code split to multiple files
- [@jslib](./docs/jslib.md) include js functions

### Unit

exists in test unit

- [@mixin](./docs/mixin.md) use reusable parts
- [@client](./docs/client.md) choose/customize client
- [@group](./docs/group.md) mark as group
- @describe describe test group or test unit

### Request

exists in `req` parts

- [@eval](./docs/eval.md) use js to generate data

### Response

exists in `res` parts

- [@eval](./docs/eval.md) use js to diff data
- [@query](./docs/eval.md) a specific case of eval
- [@every](./docs/every.md) multi-conditions test: whether all condition is true
- [@some](./docs/some.md) multi-conditions test: whether at least one condition is true
- [@partial](./docs/partial.md) only check partial of array/object
- [@type](./docs/type.md) check type other than value

