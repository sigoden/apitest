# Mixin

@mixin is for code reusing.

## main annotation

in main jsona file

```js
{
    @mixin("mixin")
}
```

It tells apitest that `mixin.jsona` is used for mixin.

For example, we write `mixin.jsona` below
```js
{
  "register": {
    "req": {
      "method": "post",
      "url": "/users"
    }
  }
}
```

## unit annotation

We can use mixin in unit test.
```js
{
    registerUserA: { @mixin("register")
        req: {
            body: {
                user: "userA",
                pass: "userApass",
            }
        }
    },
    registerUserB: { @mixin("register")
        req: {
            body: {
                user: "userB",
                pass: "userApass",
            }
        }
    }
}
```

The mixin will expand and merge to unit test like below.
```js
{
    registerUserA: {
        req: {
            "method": "post",
            "url": "/users",
            body: {
                user: "userA",
                pass: "userApass",
            }
        }
    },
    registerUserB: { @mixin("register")
        req: {
            "method": "post",
            "url": "/users",
            body: {
                user: "userB",
                pass: "userApass",
            }
        }
    }
}
```

A unit test can have multiple mixins.

```js
{
    test1: { @mixin(["register","okBody"])
    }
}
```