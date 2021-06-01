# Eval

@eval uses js

## req annotation

@eval generated data in `req` parts.

```js
{
    test1: {
        req: {
            v1: "rand.str(4)", @eval // generate 4 chars string
        }
    }
}
```

## res annotation

@eval compare data in `res` parts. If eval express returns true, the test is passed.

```js
{
    test1: { @client('echo')
        req: {
            v1: 3
        },
        res: {
            v1: "$ === 3", @eval 
        }
    }
}
```

**$ repersent the actual value to compared with**


## eval context

Apitest regist [jslib](./jslib.md) to eval context. so you can define functions in jslib and use functions
in req eval and res eval.

Apitest also collect the data of test cases and regist it to eval context.

```js
// module mod1
{
    test1: { @mixin("login")
        req: {
            body: {
                user: "userA",
                pass: "passA",
            }
        },
        res: {
            body: {
                token: "...",
            }
        }
    }
}

// module mod2
{
    test1: {
        req: {
            body: {
                v1: "abc"
            }
        }
    },
    group1: {
        test2: {
            req: {
                body: {
                    v2: "def"
                }
            }
        },
        test3: {
            req: {
                header: {
                    Authorization: `"Bearer " + mod1.test1.res.body.token` @eval // we access data in mod1.test1
                },
                body: {
                    v1_0: "mod2.test1.req.body.v1", @eval
                    v1_1: "test1.req.body.v1", @eval // omit current mod <mod2.>
                    v2_0: "mod2.group1.test2.req.body.v2", @eval
                    v2_1: "group1.test2.req.body.v2", @eval 
                    v2_2: "test2.req.body.v2", @eval // omit current mod and current group <mod2.gruop1>
                    v3: "xyz",
                }
            },
            res: {
                body: {
                    v3: "req.body.v3", @eval // omit <mod2.group1.test3> 
                }
            }
        }
    }
}
```

## @query

@query is syntax sugar of eval to compare value is equal to eval expression

```js
{
    test1: { @client("echo")
        req: {
            v1: 3,
            v2: 4,
        },
        res: {
            v1: "req.body.v1", @query
            v2: "$ == req.body.v2", @eval
        }
    }
}
```