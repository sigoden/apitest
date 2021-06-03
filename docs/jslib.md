# Jslib

Apitest can run javascript with [@eval](./eval.md)

@jslib includes user-defined js library.

## main annotaion

```js
{
    @jslib("mylib")
}
```

Apitest will include functions defined in mylib.js.

For example, if your write codes in mylib.js

```js
function add(a, b) {
    return a + b
}
```
Your can use `add` in `@eval`
```js
{
    test1: { @client("echo")
      req: {
          v1: `add(3, 4)`, @eval // 7
      }
    }
}
```