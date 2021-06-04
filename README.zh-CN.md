# Apitest

[![build](https://github.com/sigoden/apitest/actions/workflows/ci.yaml/badge.svg?branch=master)](https://github.com/sigoden/apitest/actions/workflows/ci.yaml)
[![release](https://img.shields.io/github/v/release/sigoden/apitest)](https://github.com/sigoden/apitest/releases)
[![npm](https://img.shields.io/npm/v/@sigodenjs/apitest)](https://www.npmjs.com/package/@sigodenjs/apitest)

Apitest 是一款使用类JSON的DSL编写测试用例的自动化测试工具。

其他语言版本: [English](./README.md)

- [Apitest](#apitest)
  - [示例](#示例)
  - [安装](#安装)
  - [特性](#特性)
    - [类JSON的DSL编写用例](#类json的dsl编写用例)
    - [跨平台，跨编程语言](#跨平台跨编程语言)
    - [支持Mock](#支持mock)
    - [数据即断言](#数据即断言)
    - [数据即变量](#数据即变量)
    - [支持Mixin](#支持mixin)
    - [支持CI](#支持ci)
    - [支持TDD](#支持tdd)
    - [用户定义函数](#用户定义函数)
  - [注解](#注解)
    - [入口文件注解](#入口文件注解)
    - [用例注解](#用例注解)
  - [客户端](#客户端)
    - [Echo](#echo)
    - [Http](#http)
  - [命令行](#命令行)
    - [多测试环境](#多测试环境)
    - [常规模式](#常规模式)
    - [CI模式](#ci模式)
 
## 示例

终端中执行
```
apitest examples/realworld
```

命令输出如下
```
module main
  prepare ✔
module auth
  Register (0.869) ✔
  Login (0.644) ✔
  Current User (0.578) ✔
  Update User (0.598) ✔
module article1
  All Articles (0.762) ✔
  Articles by Author (0.507) ✔
  Articles Favorited by Username (0.490) ✔
  Articles by Tag (0.832) ✔
module article2
  Create Article (0.625) ✔
  Feed (0.591) ✔
  All Articles with auth (1.193) ✔
  Articles by Author with auth (0.573) ✔
  Articles Favorited by Username with auth (0.569) ✔
  Single Article by slug (0.623) ✔
  Articles by Tag (0.879) ✔
  Update Article (0.739) ✔
  Favorite Article (0.619) ✔
  Unfavorite Article (0.617) ✔
  Create Comment for Article (0.618) ✔
  All Comments for Article (0.594) ✔
  All Comments for Article without auth (0.616) ✔
  Delete Comment for Article (0.602) ✔
  Delete Article (0.635) ✔
module profile
  Register Celeb (0.659) ✔
  Profile (0.552) ✔
  Follow Profile (0.606) ✔
  Unfollow Profile (0.526) ✘
module tag
  All Tags (1.561) ✔

1. Unfollow Profile(profile.unfollowProfile)
   profile.unfollowProfile.res.body.profile.following: true ≠ false
```

Apitest 会依序执行测试用例并打印测试结果。

## 安装

推荐从[Github Releases](https://github.com/sigoden/apitest/releases)下载可执行文件。

Apitest工具是单可执行文件，不需要安装，放到`PATH`路径下面就可以直接运行

如果你使用 node，可以通过运行 `npm install -g @sigodenjs/apitest` 安装

## 特性

### 类JSON的DSL编写用例

测试用例本身就可以作为接口使用的辅助参考文档。

```
{
    test1: { @describe("用户登录")
        req: {
            url: 'http://localhost:3000/login'
            method: 'post',
            body: {
                user: 'jason',
                pass: 'a123456,
            }
        },
        res: {
            status: 200
            body: {
                user: 'jason',
                token: '', @type
                expireIn: 0, @type
            }
        }
    }
}
```

根据上面的用例，我不用细说，有经验的后端应该能猜出这个接口传了什么参数，服务端返回了什么数据。

Apitest 的工作原理就是根据`req`部分的描述构造请求传给后端，收到后端的响应数据后依据`res`部分的描述校验数据。

拜托不要被DSL吓到啊。其实就是JSON，松了一些语法限制(不强制要求双引号，支持注释等)，只添加了一个特性：注解。上面例子中的`@describe`,`@type`就是[注解](#注解)。

> 顺便说一句，有款vscode插件提供了DSL(jsona)格式的支持哦。

### 跨平台，跨编程语言

Apitest 是一款命令行工具，支持linux,windows,mac系统。本身的测试用例使用DSL编写，不依赖特定语言经验。

### 支持Mock

有了Mock, 从此不再纠结编造数据

Apitest 支持近40个mock函数。详细清单见[sigodne/fake.js](https://github.com/sigoden/fake-js#doc)。

```
{
    test1: {
        req: {
            email: 'email', @mock
            username: 'username', @mock
            integer: 'integer(-5, 5)', @mock
            image: 'image("200x100")', @mock
            string: 'string("alpha", 5)', @mock
            date: 'date', @mock  // iso8601格式的当前时间 // 2021-06-03T07:35:55Z
            date1: 'date("yyyy-mm-dd HH:MM:ss")' @mock // 2021-06-03 15:35:55
            date2: 'date("unix")', @mock // unix epoch 1622705755
            date3: 'date("","3 hours 15 minutes")', @mock // 3小时15分钟后
            date4: 'date("","2 weeks ago")', @mock // 2周前
            ipv6: 'ipv6', @mock
            sentence: 'sentence', @mock
            cnsentence: 'cnsentence', @mock // 中文段落
        }
    }
}
```
> Apitest 使用的是自己的mock库(参考了mock.js)，mock函数很自由添加的。有想要的mock欢迎提交issue。


### 数据即断言

这句话有点绕，下面举例说明下。

```json
{
    "foo1": 3,
    "foo2": ["a", "b"],
    "foo3": {
        "a": 3,
        "b": 4
    }
}
```
假设接口响应数据如上，那么其测试用例如下:

```
{
    test1: {
        req: {
        },
        res: {
            body: {
                "foo1": 3,
                "foo2": ["a", "b"],
                "foo3": {
                    "a": 3,
                    "b": 4
                }
            }
        }
    }
}
```
没错，就是一模一样的。Apitest 会对数据的各个部分逐一进行比对。有任何不一致的地方都会导致测试不通过。

常规的测试工具提供的策略是做加法，这个很重要我才加一句断言。而在 Apitest 中，你只能做减法，这个数据不关注我主动忽略或放松校验。

比如前面的用例

```
{
    test1: { @describe("用户登录")
        ...
        res: {
            body: {
                user: 'jason',
                token: '', @type
                expireIn: 0, @type
            }
        }
    }
}
```

我们还是校验了所有的字段。因为`token`和`expireIn`值是变的，我们使用`@type`告诉 Apitest 只校验字段的类型，而忽略具体的值。

 ### 数据即变量

后面的测试用例可以使用前面测试用例的数据的所有数据。

```
{
    test1: { @describe("登录")
        ...
        res: {
            body: {
                token: '', @type
            }
        }
    },
    test2: { @describe("发布文章")
        req: {
            header: {
                authorization: `"Bearer " + test1.res.body.token`, @eval // 此处访问了前面测试用例 test1 的响应数据
            },
        }
    },
    test3: {  @client('echo')
        req: {
            foo: "env.FOO", @eval // 使用环境变量
        }
    }
}
```

### 支持Mixin

巧用 Mixin，摆脱复制粘贴

一般一个接口不会只被一个用例用到吧。我们可以把路由抽离到 mixin 中，避免每个用例都需要复制一遍路由信息。

```
{
    createPost: { // 抽离路由信息到mixin
        req: {
            url: '/posts',
            method: 'post',
        },
    },
    auth1: { // 抽离鉴权到minxin
        req: {
            header: {
                authorization: `"Bearer " + test1.res.body.token`, @eval
            }
        }
    }
}
```

```
{
    createPost1: { @describe("写文章1") @mixin(["createPost", "auth1"])
        req: {
            body: {
                title: "sentence", @mock
            }
        }
    },
    createPost2: { @describe("写文章2，带描述") @mixin(["createPost", "auth1"])
        req: {
            body: {
                title: "sentence", @mock
                description: "paragraph", @mock
            }
        }
    },
}
```

你get到了吗？

### 支持CI

本身作为一款命令行工具，就十分容易和后端的ci集成在一起。而且 apitest 还提供了`--ci`选项专门就ci做了优化。

### 支持TDD

用例就是json，所有你可以分分钟编写，这就十分有利于 tdd 了。

你甚至可以只写 `req` 部分，接口有响应后再把响应数据直接贴过来作为 `res` 部分。经验之谈 🐶

默认模式下(非ci)，当 Apitest 碰到失败的测试会打印错误并退出。 Apitest 有缓存测试数据，你可以不停重复执行错误的用例，边开发边测试， 直到走通才进入后续的测试。

同时，你还可以通过 `--only` 选项选择某个测试用例执行。

tdd! tdd! tdd!

### 用户定义函数

这个功能你根本不需要用到。但我还是担心在某些极限或边角的场景下需要，所以还是支持了。

Apitest 允许用户通过 js 编写用户定义函数构造请求数据或校验响应数据。(还敢号称跨编程语言吗？🐶)

编写函数`lib.js`
```js

// 创建随机颜色
function randColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// 判断是否是ISO8601(2021-06-02:00:00.000Z)风格的时间字符串
function isDate(date) {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(date)
}
```

使用函数
```
@jslib("lib") // 引入js文件

{
    test1: {
        req: {
            body: {
                color: 'makeColor()', @eval // 调用 `randColor` 函数生成随机颜色
            }
        },
        res: {
            body: {
                createdAt: 'isDate($)', @eval // $ 表示须校验字段，对应响应数据`res.body.createdAt`

                // 当然你可以直接使用regex
                updatedAt: `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test($)`, @eval
            }
        }
    }
}
```

## 注解

Apitest 使用JSONA格式描述测试用例。

JSONA其实就是JSON，松了一些语法限制(不强制要求双引号，支持注释等)，再添加了一个特性：注解。即 JSONA = JSON + 注解。

JSON描述数据，注解描述逻辑。

### 入口文件注解

- @module 引入子模块
- @jslib 引入用户自定义函数文件
- @mixin 引入mixin文件
- @client 配置客户端

```
{
    @client({
        name: "apiv1",
        kind: "http",
        options: {
            baseURL: "http://localhost:3000/apiv1",
            timeout: 30000,
        }
    })
    @module("auth")
    @jslib("lib")
    @mixin("mixin")
}
```

### 用例注解

- @mixin 引用mixin
- @client 选择客户端
- @group 用例组标记

- @eval 使用js表达式生成数据(`req`中)，校验数据(`res`中)
- @mock 使用mock函数生成数据

- @every 一组断言全部通过才测试通过
- @some 一组断言有一个通过就测试通过
- @parital 标记仅局部校验而不是全等校验
- @type 标记仅校验数据的类型

```
{
    group1 { @group // 使用@group标记用例组
        test1: { @client("echo") @mixin(["createPost","auth1"])
            req: {
                v1: "Date.now()", @eval
                v2: "string(8)", @mock
                v3: "integer(2,6)", @mock
                v4: "integer(2,6)", @mock
                v5: {
                    a: 3,
                    b: 4,
                },
                v6: [
                    3,
                    4,
                ]
            },
            res: {
                v1: 0, @type // 使用@type，我们仅校验`v1`值是整数型，而不管其具体值。
                v2: "$.length === 8", @eval
                v3: [ @every
                    "$ > 3", @eval
                    "$ > 4", @eval
                ],
                v4: [ @some
                    "$ > 2", @eval
                    "$ <= 2", @eval
                ],
                v5: { @partial // 使用@partial，我们仅校验对象中我们感兴趣的部分`a`，忽略`b`
                    a: 3,
                },
                v6: [ @partial // 使用@partial，我们仅校验数组中的第一个元素
                    3
                ]
            }
        }
    }
}
```

## 客户端

用例的`req`和`res`数据结构由客户端定义

客户端负责根据`req`构造请求，发给服务端，接收服务端的响应，构造`res`响应数据。

如果用例没有使用`@client`注解指定客户端，则默认客户端。

如果在入口文件中没有定义默认客户端。Apitest会自动插入`@client({name:"default",kind:"http"})`将`http`作为默认客户端

Apitest 提供两种客户端。

### Echo

`echo`客户端不发出任何请求，直接把`req`部分的数据原样返回作为`res`数据。

```
{
    test1: { @client("echo")
        req: { // 随便填
        },
        res: { // 同req
        }
    }
}
```

### Http

`http`客户端处理http/https请求响应。

```
{
    test1: { @client({options:{timeout: 10000}}) // 自定义客户端参数
        req: {
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
        },
        res: {
            status: 200, // http status code
            header: { // http response headers
                "X-Amzn-Trace-Id": "Root=1-60b59dd1-1a896caf5291bbae089ffe26"
            },
            body: { // response body

            }
        }
    }
}
```

`http` 客户端可选项

```js
{
    // `baseURL` will be prepended to `url` unless `url` is absolute.
    // It can be convenient to set `baseURL` for an instance of axios to pass relative URLs
    // to methods of that instance.
    baseURL: 'https://some-domain.com/api/',
    // `timeout` specifies the number of milliseconds before the request times out.
    // If the request takes longer than `timeout`, the request will be aborted.
    timeout: 1000, // default is `0` (no timeout)
    // `withCredentials` indicates whether or not cross-site Access-Control requests
    // should be made using credentials
    withCredentials: false, // default
}
```

## 命令行

```
usage: apitest [options] [target]

Options:
  -h, --help     Show help                                             [boolean]
  -V, --version  Show version number                                   [boolean]
      --ci       Whether to run in ci mode                             [boolean]
      --reset    Whether to continue with last case                    [boolean]
      --dry-run  Check syntax then print all cases                     [boolean]
      --env      Specific test enviroment like prod, dev                [string]
      --only     Run specific module/case                               [string]
```

### 多测试环境

Apitest 支持多测试环境，通过 `--env` 选项指定.

```
// 预发布环境 main.jsona
{
    @client({
        options: {
            url: "http://pre.example.com/api"
        }
    })
    @module("mod1")
}
```

```
// 本地环境 main.local.jsona
{
    @client({
        options: {
            url: "http://localhost:3000/api"
        }
    })
    @module("mod1")
    @module("mod2") // 仅本地测试模块
}
```

```sh
# 默认选择 tests/main.local.jsona 
apitest tests
# 选择 tests/main.local.jsona 
apitest tests --env local
```

Apitest 允许指定 main.jsona
```sh
apitest tests/main.jsona
apitest tests/main.local.jsona
```

指定具体的 main.jsona，仍然可以使用 `--env` 选项
```sh
# 选择 tests/main.local.jsona 
apitest tests/main.jsona --env local
```

### 常规模式

- 从上次失败的用例开始执行，碰到失败的用例打印错误详情并退出
- 如果有选项 `--reset`，则从头开始执行而不是上次失败的地方
- 如果有选项 `--only mod1.test1`，则仅执行选择的测试用例

### CI模式

- 忽略缓存，从头开始执行测试用例
- 碰到失败的测试用例继续执行
- 所有用例执行完成后，统一打印错误