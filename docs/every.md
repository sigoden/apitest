# Every

@some tests whether all condition is true.

```js
{
    test1: { @client("echo")
        req: {
            v1: 'integer(0,3)', @mock
        },
        res: {
            v1: [ @every
                '$ >= 0', @eval
                '$ <= 3', @eval
            ] 
        }
    }
}
```
