# Jslib

Apitest can run javascript with [@eval](./eval.md)

@jslib include js functions.

## main annotaion

```js
{
    @jslib("@rand")
    @jslib("mylib")
}
```

Apitest will include functions defined in builtin/rand.js and mylib.js.

> @jslib value starts with "@" means it's a builtin lib.


## builtin lib

### @rand

include in main jsona file
```js
{
    @jslib("@rand")
}
```

#### rand.str(len, flags)

Generate random string of length len. flags is a bitflags
- bitflag 1 => 0123456789 // num
- bitflag 2 => abcdefghijklmnopqrstuvwxyz // lowercase
- bitflag 4 => ABCDEFGHIJKLMNOPQRSTUVWXYZ // uppercase 

```js
{
    test1: { @client('echo')
        req: {
            v1: "rand.str(3)", @eval // generated 3 chars string with charset num + lowercase + uppercase
            v2: "rand.str(3, 1)", @eval // generrate 3 chars string with charset num 
            v2: "rand.str(4, 3)", @eval// generrate 4 chars string with charset num + lowercase
        }
    }
}
```

### rand.int(min, max)

Generate random integer

```js
{
    test1: { @client('echo')
        req: {
            v1: "rand.int(1, 3)", @eval // generated intenger in [1, 3]
        }
    }
}
```

### rand.num(min, max, percision)

Generate random float number
```js
{
    test1: { @client('echo')
        req: {
            v1: "rand.num(0, 1)", @eval // generate float in (0, 1)
            v1: "rand.num(0, 100, 2)", @eval // generate float in (0, 100) with 2 point
        }
    }
}
```