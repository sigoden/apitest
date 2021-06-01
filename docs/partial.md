# Partial

Apitest will take strict checking on array/object. 

@partial tells aptest only checks partial of array/object.

```js
{
    test1: { @client("echo")
        req: {
            v1: [
                1,
                2,
                3,
            ],
            v2: {
                a: 3,
                b: 4,
                c: 5,
            }
        },
        res: {
            v1: [ @partial
                1
            ],
            v2: { @partial
                a: 3,
            }
        }
    }
}
```