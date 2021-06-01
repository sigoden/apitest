# Some

@some is for multi-conditions test. It tests whether at least one condition is true.

```js
{
    test1: { @client("echo")
        req: {
            v1: 'rand.num(0, 1)', @eval
        },
        res: {
            v1: [ @some
                '$ > 0.5', @eval
                '$ <= 0.5', @eval
            ]
        }
    }
}
```