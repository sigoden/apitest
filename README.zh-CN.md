# Apitest

[![build](https://github.com/sigoden/apitest/actions/workflows/ci.yaml/badge.svg?branch=master)](https://github.com/sigoden/apitest/actions/workflows/ci.yaml)
[![release](https://img.shields.io/github/v/release/sigoden/apitest)](https://github.com/sigoden/apitest/releases)
[![npm](https://img.shields.io/npm/v/@sigodenjs/apitest)](https://www.npmjs.com/package/@sigodenjs/apitest)

Apitest 是一款使用类JSON的DSL编写测试用例的自动化测试工具。

其他语言版本: [English](./README.md)

- [Apitest](#apitest)
  - [安装](#安装)
  - [开始使用](#开始使用)
  - [特性](#特性)
    - [JSONA-DSL](#jsona-dsl)
    - [数据即断言](#数据即断言)
    - [数据可访问](#数据可访问)
    - [支持Mock](#支持mock)
    - [支持Mixin](#支持mixin)
    - [支持CI](#支持ci)
    - [支持TDD](#支持tdd)
    - [支持用户定义函数](#支持用户定义函数)
    - [跳过,延时,重试和循环](#跳过延时重试和循环)
    - [支持Form,文件上传,GraphQL](#支持form文件上传graphql)
  - [注解](#注解)
    - [@module](#module)
    - [@jslib](#jslib)
    - [@mixin](#mixin)
    - [@client](#client)
    - [@describe](#describe)
    - [@group](#group)
    - [@eval](#eval)
    - [@mock](#mock)
    - [@file](#file)
    - [@trans](#trans)
    - [@every](#every)
    - [@some](#some)
    - [@partial](#partial)
    - [@type](#type)
    - [@optional](#optional)
  - [执行控制](#执行控制)
    - [跳过](#跳过)
    - [延时](#延时)
    - [重试](#重试)
    - [循环](#循环)
    - [打印控制](#打印控制)
  - [客户端](#客户端)
    - [Echo](#echo)
    - [Http](#http)
      - [配置](#配置)
      - [Cookies](#cookies)
      - [x-www-form-urlencoded](#x-www-form-urlencoded)
      - [multipart/form-data](#multipartform-data)
      - [graphql](#graphql)
  - [命令行](#命令行)
    - [多测试环境](#多测试环境)
    - [常规模式](#常规模式)
    - [CI模式](#ci模式)


## 安装

推荐从[Github Releases](https://github.com/sigoden/apitest/releases)下载可执行文件。

Apitest工具是单可执行文件，不需要安装，放到`PATH`路径下面就可以直接运行

```
# linux
curl -L -o apitest https://github.com/sigoden/apitest/releases/latest/download/apitest-linux 
chmod +x apitest
sudo mv apitest /usr/local/bin/

# macos
curl -L -o apitest https://github.com/sigoden/apitest/releases/latest/download/apitest-macos
chmod +x apitest
sudo mv apitest /usr/local/bin/

# npm
npm install -g @sigodenjs/apitest
```
## 开始使用

编写测试文件 `httpbin.jsona`

```
{
  test1: {
    req: {
      url: "https://httpbin.org/post",
      method: "post",
      headers: {
        'content-type': 'application/json',
      },
      body: {
        v1: "bar1",
        v2: "Bar2",
      },
    },
    res: {
      status: 200,
      body: { @partial
        json: {
          v1: "bar1",
          v2: "bar2"
        }
      }
    }
  }
}

```

运行测试

```
apitest httpbin.jsona

main
  test1 (0.944) ✘
  main.test1.res.body.json.v2: bar2 ≠ Bar2

  ...
```

用例测试失败，从Apitest打印的错误信息中可以看到, `main.test1.res.body.json.v2` 的实际值是 `Bar2` 而不是 `bar2`。

我们修改 `bar2` 成 `Bar2` 后，再次执行 Apitest

```
apitest httpbin.jsona

main
  test1 (0.930) ✔
```

## 特性

### JSONA-DSL

使用类JSON的DSL编写测试。文档即测试。

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

拜托不要被DSL吓到啊。其实就是JSON，减轻了一些语法限制(不强制要求双引号，支持注释等)，只添加了一个特性：注解。上面例子中的`@describe`,`@type`就是[注解](#注解)。

点击[jsona/spec](https://github.com/jsona/spec)查看JSONA规范

> 顺便说一句，有款vscode插件提供了DSL(jsona)格式的支持哦。

为什么使用JSONA？

接口测试的本质的就是构造并发送`req`数据，接收并校验`res`数据。数据即是主体又是核心，而JSON是最可读最通用的数据描述格式。
接口测试还需要某些特定逻辑。比如请求中构造随机数，在响应中只校验给出的部分数据。

JSONA = JSON + Annotation(注解)。JSON负责数据部分，注解负责逻辑部分。完美的贴合接口测试需求。

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

 ### 数据可访问

后面的测试用例很容易地使用前面测试用例的数据。

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
      headers: {
        authorization: `"Bearer " + test1.res.body.token`, @eval // 此处访问了前面测试用例 test1 的响应数据
      },
    }
  }
}
```

### 支持Mock

有了Mock, 从此不再纠结编造数据。详见[@mock](#mock)

### 支持Mixin

巧用 Mixin，摆脱复制粘贴。详见[@mixin](#mixin)

### 支持CI

本身作为一款命令行工具，就十分容易和后端的ci集成在一起。而且 apitest 还提供了`--ci`选项专门就ci做了优化。

### 支持TDD

用例就是json，所有你可以分分钟编写，这就十分有利于 tdd 了。

你甚至可以只写 `req` 部分，接口有响应后再把响应数据直接贴过来作为 `res` 部分。经验之谈 🐶

默认模式下(非ci)，当 Apitest 碰到失败的测试会打印错误并退出。 Apitest 有缓存测试数据，你可以不停重复执行错误的用例，边开发边测试， 直到走通才进入后续的测试。

同时，你还可以通过 `--only` 选项选择某个测试用例执行。

### 支持用户定义函数

这个功能你根本不需要用到。但我还是担心在某些极限或边角的场景下需要，所以还是支持了。

Apitest 允许用户通过 js 编写用户定义函数构造请求数据或校验响应数据。(还敢号称跨编程语言吗？🐶) 详见[@jslib](#jslib)

### 跳过,延时,重试和循环

详见[#执行控制](#执行控制)

### 支持Form,文件上传,GraphQL

详见[#http](#http)

## 注解

Apitest 使用JSONA格式描述测试用例。 JSON描述数据，注解描述逻辑。

### @module

- 功能: 引入子模块
- 使用范围: 入口文件

```
// main.jsona
{
  @module("mod1")
}

// mod1.jsona
{
  test1: {
    req: {
    }
  }
}
```

### @jslib

- 功能：引入用户脚本
- 使用范围: 入口文件

编写函数`lib.js`
```js

// 创建随机颜色
exports.makeColor = function () {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// 判断是否是ISO8601(2021-06-02:00:00.000Z)风格的时间字符串
exports.isDate = function (date) {
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
        color: 'makeColor()', @eval // 调用 `makeColor` 函数生成随机颜色
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


### @mixin

- 功能: 引入mixin文件
- 使用范围: 入口文件，用例(组)头部

首先创建一个文件存储Mixin定义的文件

```
// mixin.jsona
{
  createPost: { // 抽离路由信息到mixin
    req: {
      url: '/posts',
      method: 'post',
    },
  },
  auth1: { // 抽离鉴权到minxin
    req: {
      headers: {
        authorization: `"Bearer " + test1.res.body.token`, @eval
      }
    }
  }
}
```

```
@mixin("mixin") // 引入 mixin.jsona 文件

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

越是频繁用到的数据越适合抽离到Mixin。　

### @client

- 功能: 配置客户端
- 使用范围: 入口文件，用例(组)头部

[客户端](#client)负责根据`req`构造请求，发给服务端，接收服务端的响应，构造`res`响应数据。

```
{
  @client({
    name: "apiv1",
    kind: "http",
    options: {
      baseURL: "http://localhost:3000/api/v1",
      timeout: 30000,
    }
  })
  @client({
    name: "apiv2",
    kind: "http",
    options: {
      baseURL: "http://localhost:3000/api/v2",
      timeout: 30000,
    }
  })
  test1: { @client("apiv1") 
    req: {
      url: "/posts" // 使用apiv1客户端，所以请求路径是  http://localhost:3000/api/v1/posts
    }
  },
  test2: { @client({name:"apiv2",options:{timeout:30000}})
    req: {
      url: "/key" // 使用apiv2客户端，所以请求路径是 http://localhost:3000/api/v2/posts
    }
  },
}
```

### @describe

- 功能：用例或组描述
- 使用范围: 模块文件，用例(组)头部

```
{
  @describe("这是一个模块")
  @client({name:"default",kind:"echo"})
  group1: { @group @describe("这是一个组")
    test1: { @describe("最内用例")
      req: {
      }
    },
    group2: { @group @describe("这是一个嵌套组")
      test1: { @describe("嵌套组内的用例")
        req: {
        }
      }
    }
  }
}
```
上面的测试文件打印如下

```
这是一个模块
  这是一个组
    最内用例 ✔
    这是一个嵌套组
      嵌套组内的用例 ✔
```

如果去掉的`@description`，打印如下

```
main
  group1
    test1 ✔
    group2
      test1 ✔
```

### @group

- 功能：用例组标记
- 使用范围: 用例组头部

组内的测试用例会继承组的 `@client` 和 `@mixin`。组还支持[执行控制](#执行控制)。

```
{
  group1: { @group @mixin("auth1") @client("apiv1")
    test1: {

    },
    // 用例的mixin和组的mixin会合并成 @mixin(["route1","auth1"])
    test2: { @mixin("route1") 

    },
    test3: { @client("echo") // 用例的client会覆盖组的client

    },
    group2: { @group // 嵌套组

    },
    run: {

    }
  }
}
```

### @eval

- 功能: 使用js表达式生成数据(`req`中)，校验数据(`res`中)
- 使用范围: 用例数据块

`@eval` 特点

- 可以使用JS内置函数
- 可以使用jslib中的函数
- 可以使用环境变量
- 可以使用前面测试的数据

```
{
  test1: { @client("echo")
    req: {
      v1: "JSON.stringify({a:3,b:4})", @eval // 使用JS内置函数
      v2: `
        let x = 3;
        let y = 4;
        x + y
        `, @eval  // 支持代码块
      v3: "env.FOO", @eval // 访问环境变量
      v4: 'mod1.test1.res.body.id`, @eval // 访问前面测试的数据
    }
  }
}

```

`@eval` 在 `res` 块中使用时还有如下特点

- 通过 `$` 获取该位置对应的响应数据
- 返回值true表示校验通过
- 如果返回值不是bool类型，则会再把返回值同响应数据进行全等匹配校验

```
{
  rest2: {
    res: {
      v1: "JSON.parse($).a === 3",  @eval // $ 待校验数据
      v2: "true", @eval // true强制校验通过
      v4: 'mod1.test1.res.body.id`, @eval // 返回值再全等比较
    }
  }
}
```

**`@eval` 在访问用例数据时可以使用缩写**

```
{
  test1: {
    req: {
      v1: 3,
    },
    res: {
      v1: "main.test1.req.v1", @eval
   // v1:      "test1.req.v1", @eval
   // v1:            "req.v1", @eval
    }
  }
}
```

### @mock

- 功能: 使用mock函数生成数据
- 使用范围: 用例`req`数据块

Apitest 支持近40个mock函数。详细清单见[fake-js](https://github.com/sigoden/fake-js#doc)。

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

### @file

功能: 使用文件
使用范围: 用例`req`数据块

```
{
  test1: {
    req: {
      headers: {
        'content-type': 'multipart/form-data',
      },
      body: {
        field: 'my value',
        file: 'bar.jpg', @file // 上传文件 `bar.jpg`
      }
    },
  }
}
```

### @trans

- 功能: 变换数据 
- 使用范围: 用例数据块

```
{
  test1: { @client("echo")
    req: {
      v1: { @trans(`JSON.stringify($)`)
        v1: 1,
        v2: 2,
      }
    },
    res: {
      v1: `{"v1":1,"v2":2}`,
    }
  },
  test2: { @client("echo")
    req: {
      v1: `{"v1":1,"v2":2}`,
    },
    res: {
      v2: { @trans(`JSON.parse($)`)
        v1: 1,
        v2: 2,
      }
    }
  }
}
```

###  @every

- 功能:  一组断言全部通过才测试通过
- 使用范围: 用例`res`数据块

```
{
  test1: { @client("echo")
    req: {
      v1: "integer(1, 10)", @mock
    },
    res: {
      v1: [ @every
        "$ > -1", @eval
        "$ > 0", @eval
      ]
    }
  }

}
```

### @some


- 功能: 一组断言有一个通过就测试通过
- 使用范围: 用例`res`数据块

```
{
  test1: { @client("echo")
    req: {
      v1: "integer(1, 10)", @mock
    },
    res: {
      v1: [ @some
        "$ > -1", @eval
        "$ > 10", @eval
      ]
    }
  }
}
```

### @partial

- 功能: 标记仅局部校验而不是全等校验
- 使用范围: 用例`res`数据块

```
{
  test1: { @client("echo")
    req: {
      v1: 2,
      v2: "a",
    },
    res: { @partial
      v1: 2,
    }
  },
  test2: { @client("echo")
    req: {
      v1: [
        1,
        2
      ]
    },
    res: {
      v1: [ @partial
        1
      ]
    }
  }
}
```

### @type

- 功能: 标记仅校验数据的类型
- 使用范围: 用例`res`数据块

```
{
  test1: { @client("echo")
    req: {
      v1: null,
      v2: true,
      v3: "abc",
      v4: 12,
      v5: 12.3,
      v6: [1, 2],
      v7: {a:3,b:4},
    },
    res: {
      v1: null, @type
      v2: false, @type
      v3: "", @type
      v4: 0, @type
      v5: 0.0, @type
      v6: [], @type
      v7: {}, @type
    }
  },
}
```

### @optional

- 功能: 标记字段可选
- 使用范围: 用例`res`数据块

```
{
  test1: { @client("echo")
    req: {
      v1: 3,
      // v2: 4, 可选字段
    },
    res: {
      v1: 3,
      v2: 4, @optional
    }
  }
}
```

## 执行控制

Apitest 允许测试用例或组通过 `run` 属性自定义执行逻辑。

### 跳过

```
{
  test1: { @client("echo")
    req: {
    },
    run: {
      skip: `mod1.test1.res.status === 200`, @eval
    }
  }
}
```

- `run.skip` 值为true时跳过测试

### 延时

等待一段时间后再执行测试用例

```
{
  test1: { @client("echo")
    req: {
    },
    run: {
      delay: 1000,
    }
  }
}
```

- `run.delay` 等待时间

### 重试

```
{
  test1: { @client("echo")
    req: {
    },
    run: {
      retry: {
        stop:'$run.count> 2', @eval
        delay: 1000,
      }
    },
  }
}
```

变量
- `$run.count` 当前重试次数

配置
- `run.retry.stop` 为true时退出重试
- `run.retry.delay` 重试间隔时间

### 循环

```
{
  test1: { @client("echo")
    req: {
      v1:'$run.index', @eval
      v2:'$run.item', @eval
    },
    run: {
      loop: {
        delay: 1000,
        items: [
          'a',
          'b',
          'c',
        ]
      }
    },
  }
}
```

变量
- `$run.item` 当前循环数据
- `$run.index` 当前循环数据索引，也可以当成次数 

配置
- `run.loop.items`  循环数据
- `run.loop.delay` 循环时间间隔


### 打印控制

```
{
  test1: { @client("echo")
    req: {
    },
    run: {
      dump: true,
    }
  }
}
```

- `run.dump` 为true时强制打印请求响应数据

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
  test1: { @client('echo')
    req: { // 随便填
    },
    res: { // 同req
    }
  }
}
```

### Http

客户端处理http/https请求响应。

```
{
  test1: { @client({options:{timeout: 10000}}) // 自定义客户端参数
    req: {
      url: "https://httpbin.org/anything/{id}", // 请求路径
      method: "post", // http方法 `get`, `post`, `delete`, `put`, `patch`
      query: { // `?foo=v1&bar=v2
        foo: "v1",
        bar: "v2",
      },
      params: {
        id: 33, // 路径占位变量 `/anything/{id}` => `/anything/33`
      },
      headers: {
        'x-key': 'v1'
      },
      body: { // 请求数据
      }
    },
    res: {
      status: 200, // 状态码
      headers: {
        'x-key': 'v1'
      },
      body: { // 响应数据
      }
    }
  }
}
```

#### 配置

```js
{
  // `baseURL` 相对路径
  baseURL: '',
  // `timeout` 指定请求超时前的毫秒数。 如果请求时间超过`timeout`，请求将被中止。
  timeout: 0,
  // `maxRedirects` 最大重定向数。如果设置为 0，则不会遵循重定向。
  maxRedirects: 0, 
  // `headers` 默认请求头
  headers: {},
  // `proxy` 配置http(s)代理, 也可以使用 HTTP_PROXY, HTTPS_PROXY 环境变量
  proxy: "http://user:pass@localhost:8080"
}
```

#### Cookies

```
{
  test1: {
    req: {
      url: "https://httpbin.org/cookies/set",
      query: {
        k1: "v1",
        k2: "v2",
      },
    },
    res: {
      status: 302,
      headers: { @partial
        'set-cookie': [], @type
      },
      body: "", @type
    }
  },
  test2: {
    req: {
      url: "https://httpbin.org/cookies",
      headers: {
        Cookie: `test1.res.headers["set-cookie"]`, @eval
      }
    },
    res: {
      body: { @partial
        cookies: {
          k1: "v1",
          k2: "v2",
        }
      }
    },
  },
}
```

#### x-www-form-urlencoded 

配置请求头 `"content-type": "application/x-www-form-urlencoded"`

```
{
  test2: { @describe('test form')
    req: {
      url: "https://httpbin.org/post",
      method: "post",
      headers: {
        'content-type':"application/x-www-form-urlencoded"
      },
      body: {
        v1: "bar1",
        v2: "Bar2",
      }
    },
    res: {
      status: 200,
      body: { @partial
        form: {
          v1: "bar1",
          v2: "Bar2",
        }
      }
    }
  },
}
```

#### multipart/form-data


配置请求头 `"content-type": "multipart/form-data"`
结合 `@file` 注解实现文件上传

```
{
  test3: { @describe('test multi-part')
    req: {
      url: "https://httpbin.org/post",
      method: "post",
      headers: {
        'content-type': "multipart/form-data",
      },
      body: {
        v1: "bar1",
        v2: "httpbin.jsona", @file
      }
    },
    res: {
      status: 200,
      body: { @partial
        form: {
          v1: "bar1",
          v2: "", @type
        }
      }
    }
  }
}
```

#### graphql

```
{
  vars: { @describe("share variables") @client("echo")
    req: {
      v1: 10,
    }
  },
  test1: { @describe("test graphql")
    req: {
      url: "https://api.spacex.land/graphql/",
      body: {
        query: `\`query {
  launchesPast(limit: ${vars.req.v1}) {
    mission_name
    launch_date_local
    launch_site {
      site_name_long
    }
  }
}\`` @eval
      }
    },
    res: {
      body: {
        data: {
          launchesPast: [ @partial
            {
              "mission_name": "", @type
              "launch_date_local": "", @type
              "launch_site": {
                "site_name_long": "", @type
              }
            }
          ]
        }
      }
    }
  }
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