# Group

we can group some releated test units as group

```js
{
    outer: { @group
        test1: { @client("echo")
            req: {
            },
        },
        test2: { @client("echo")
            req: {
            },
        },
        inner: { @group
            test3: { @client("echo")
                req: {
                },
            },
            test4: { @client("echo")
                req: {
                },
            }
        }
    }
}
```

apitest will print

```
module main
  group outer
    unit test1 ✔
    unit test2 ✔
    group inner
      unit test3 ✔
      unit test4 ✔
```
