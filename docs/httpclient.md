# HttpClient

Send req and get res through http/https protocol

## Main Annotation

```js
{
    @client({
        name: "client1"
        kind: "http",
        options: {
            baseURL: "https://httpbin.org"
            timeout: 10000,
        }
    })
}
```

HttpClient is powered by axios, so its options is same to [axios request config](https://github.com/axios/axios#request-config);

## Request

```js
{
    url: "https://httpbin.org/anything/{id}", // request url
    method: "post", // http method
    query: { // query string, will append to url like `?foo=v1&bar=v2
        foo: "v1",
        bar: "v2",
    },
    params: {
        id: 33, // url path params, will fill the placefolder in path `/anything/{id}` => `/anything/33`
    },
    header: { // http request headers
        'x-key': 'v1'
    },
    body: { // request body

    }
}
```

## Response

```js
{
    status: 200, // http status code
    header: { // http response headers
        "X-Amzn-Trace-Id": "Root=1-60b59dd1-1a896caf5291bbae089ffe26"
    },
    body: { // response body

    }
}
```