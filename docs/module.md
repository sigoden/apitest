# Module

We can split the unit tests to mutiple files, each file is a module.

## main annotation

```js
{
    @module("beforeall")
    @module("auth")
}
```

The order of module is important. apitest will run module one by one.
