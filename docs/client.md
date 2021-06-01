# Client

Apitest supports two client `echo` and `http` now. it will support more clients in the future.

## main annotation

include/config the client in main jsona file

```js
{
    @client({
        name: "default",
        kind: "http",
        options: {
            baseURL: "https://httpbin.org",
            timeout: 10000
        }
    })
}
```

- name: client name. Name will be referred by unit @client annotation. If there is no
    client named "default", apitest will automatic include  `http` client as default.
- kind: echo | http.
- options: client options. Each kind of client have its own options.

> `echo` is included by default.

> `http` client is powered by axios, so it's options is same to [axios request config](https://github.com/axios/axios#request-config);


## unit annotation

use/customize the client in unit

```js
{
    test1: { @client("echo")
    },
    test2: { @client({options:{timeout:30000}})
    },
    test3: { @client({name:"client1",options:{timeout:30000}})
    },
}
```
