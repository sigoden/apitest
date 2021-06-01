# Type

@type tell aptest only checks type of value other than value.

```js
{
    test1: { @client("echo")
        req: {
            v1: "abc",
            v2: 3,
            v3: 3.14,
            v4: true,
            v5: ['a', 'b'],
            v6: {
                a: 3,
                b: 4,
            }
        },
        res: {
            v1: "", @type
            v2: 0, @type
            v3: .0, @type
            v4: false, @type
            v5: [], @type
            v6: {}, @type
        }
    }
}
```