# Client

Apitest supports two client now

- echo: return req as res, no network needed
- [http](./httpclient.md): send req and get res through http/https protocol

## main annotation

include/config the client.

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

- name: client name. Name will be referred by @client unit annotation. If there is no
    client named "default", apitest will automatic include  `http` client as default.
- kind: echo | http.
- options: client options. Each kind of client have its own options.

> EchoClient is inclued by default. EchoClient have no options.

## unit annotation

use/customize the client for test unit.

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
