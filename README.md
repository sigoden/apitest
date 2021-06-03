# ApiTest

**apitest** is a declartive api testing tool.

## Installation

  Binaries are available in [releases](https://github.com/sigoden/apitest/releases). Make sure to put the
  path to the binary into your `PATH`.

## Getting Started


Write test case in `httpbin.jsona` 

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
        username: "alice",
        password: "@string(12)", @mock
        email: "@email", @mock
      },
    },
    res: {
      status: 200,
      body: { @partial
        json: { @partial
          username: "alice",
          email: "", @type
        },
        url: "https://httpbin.org/post"
      }
    }
  }
}
```

Run below in terminal
```
apitest httpbin.jsona
```

Apitest will print

```
module main
  httpbin post (1.018) ✘
  main.post.res.body.json.username: alce ≠ alice

```

Apitest detect value at `main.post.res.body.json.username` expect `alce` but got `alice`, it is not equal. 
so the test is failed, then apitest print error.

After we fixed `alce` to `alice`, rerun

Apitest will print
```
module main
  httpbin post (0.992) ✔
```

Test passed.

Test cases are writen in JSON(with less limitations) + Some annotations(e.g. `@describe`, `@mock`, `@type`).


[Realworld](https://github.com/gothinkster/realworld) test cases is provided as example.

```
apitest examples/realworld
```

```
module auth
  Current User (1.071) ✔
  Update User (0.506) ✔
module article1
  All Articles (0.705) ✔
  Articles by Author (0.612) ✔
  Articles Favorited by Username (0.498) ✔
  Articles by Tag (1.088) ✔
module article2
  Create Article (0.671) ✔
  Feed (0.527) ✔
  All Articles with auth (1.203) ✔
  Articles by Author with auth (0.602) ✔
  Articles Favorited by Username with auth (0.552) ✔
  Single Article by slug (0.523) ✔
  Articles by Tag (0.891) ✔
  Update Article (0.751) ✔
  Favorite Article (0.571) ✔
  Unfavorite Article (0.559) ✔
  Create Comment for Article (0.675) ✔
  All Comments for Article (0.525) ✔
  All Comments for Article without auth (0.653) ✔
  Delete Comment for Article (0.543) ✔
  Delete Article (0.610) ✔
module profile
  Register Celeb (0.674) ✔
  Profile (0.579) ✔
  Follow Profile (0.596) ✔
  Unfollow Profile (0.581) ✔
module tag
  All Tags (1.719) ✔
```

## Annotation

Apitest use jsona to write tests. Click [sigoden/jsona](https://github.com/sigoden/jsona) for more details.

Jsona = JSON + Annotation. JSON for data, annotation for logic. Annotation is interpreted as function.

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
- [@mock](./docs/mock.md) generate mock data

### Response

exists in `res` parts

- [@eval](./docs/eval.md) use js to diff data
- [@every](./docs/every.md) multi-conditions test: whether all condition is true
- [@some](./docs/some.md) multi-conditions test: whether at least one condition is true
- [@partial](./docs/partial.md) only check partial of array/object
- [@type](./docs/type.md) check type other than value

