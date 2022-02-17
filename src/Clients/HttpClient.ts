import axios, { AxiosRequestConfig } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as _ from "lodash";
import * as qs from "querystring";
import { HttpsProxyAgent, HttpProxyAgent } from "hpagent";
import * as FormData from "form-data";
import { Client } from ".";
import { Unit } from "../Cases";
import { checkValue, createAnno, existAnno, schemaValidate, toPosString } from "../utils";
import { JsonaObject, JsonaString, JsonaValue } from "jsona-js";

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

export interface HttpClientOptions {
  baseUrl?: string;
  timeout?: number;
  maxRedirects?: number;
  headers?: Record<string, string>;
  proxy?: string;
}

export const HTTP_OPTIONS_SCHEMA = {
  type: "object",
  properties: {
    baseURL: {
      type: "string",
    },
    timeout: {
      type: "integer",
    },
    maxRedirects: {
      type: "integer",
    },
    headers: {
      type: "object",
      anyProperties: {
        type: "string",
      },
    },
    proxy: {
      type: "string",
    },
  },
};

export const DEFAULT_OPTIONS: HttpClientOptions = {
  timeout: 0,
  maxRedirects: 0,
};


export default class HttpClient implements Client {
  private options: HttpClientOptions;
  public constructor(name: string, options: any) {
    if (options) {
      try {
        schemaValidate(options, [], HTTP_OPTIONS_SCHEMA, true);
        this.options = _.pick(options, ["baseURL", "timeout", "maxRedirects", "headers", "proxy"]);
        this.options = _.merge({}, DEFAULT_OPTIONS, this.options);
      } catch (err) {
        throw new Error(`[main@client(${name})[${err.paths.join(".")}] ${err.message}`);
      }
    } else {
      this.options = _.merge({}, DEFAULT_OPTIONS);
    }
  }

  public get kind() {
    return "http";
  }

  public validate(unit: Unit) {
    this.validateReq(unit.paths.concat(["req"]), unit.req);
    this.validateRes(unit.paths.concat(["res"]), unit.res);
  }

  public async run(unit: Unit, req: any) {
    const opts: AxiosRequestConfig = {
      ..._.clone(this.options),
      ...(unit.client.options || {}),
      url: req.url,
      method: req.method,
      validateStatus: () => true,
      jar,
      withCredentials: true,
      ignoreCookieErrors: true,
    };
    if (req.query) {
      opts.params = req.query;
    }
    if (req.headers) {
      opts.headers = req.headers;
    }
    if (req.params) {
      for (const key in req.params) {
        opts.url = opts.url.replace(new RegExp(`{${key}}`, "g"), req.params[key]);
      }
    }
    if (req.body) {
      if (!opts.method) opts.method = "post";
      let reqContentType: string = _.get(req, ["headers", "content-type"], _.get(req, ["headers", "Content-Type"]));
      if (!reqContentType) reqContentType =  _.get(opts, ["headers", "content-type"], _.get(opts, ["headers", "Content-Type"])) as string;
      if (!reqContentType) reqContentType = "application/json";
      _.set(opts, ["headers", "content-type"], reqContentType);
      delete opts.headers["Content-Type"];
      if (reqContentType.indexOf("application/x-www-form-urlencoded") > -1) {
        opts.data = qs.stringify(req.body);
      } else if (reqContentType.indexOf("multipart/form-data") > -1) {
        const form = new FormData();
        for (const key in req.body) {
          form.append(key, req.body[key]);
        }
        const formHeaders = form.getHeaders();
        _.set(opts, ["headers", "content-type"], formHeaders["content-type"]);
        opts.data = form;
      } else {
        opts.data = req.body;
      }
    }
    setProxy(opts);
    try {
      const { headers, status, data } = await client(opts);
      return { headers, status, body: data };
    } catch (err) {
      throw err;
    }
  }

  private validateReq(paths: string[], req: JsonaValue) {
    checkValue(paths, req, [
      { paths: [], required: true, type: "Object" },
      { paths: ["url"], required: true, type: "String" },
      { 
        paths: ["method"], 
        type: "String", 
        check: (paths: string[], method: JsonaString) => {
          if (["post", "get", "put", "delete", "patch"].indexOf(method.value) === -1) {
            throw new Error(`${paths.join(".")}: is not valid http method${toPosString(method.position)}`);
          }
        },
      },
      { paths: ["params"], type: "Object" },
      { paths: ["params", "*"], type: "Scalar", required: true },
      { paths: ["headers"], type: "Object" },
      { paths: ["headers", "*"], type: "Scalar", required: true  },
      { paths: ["query"], type: "Object" },
      { paths: ["query", "*"], type: "Scalar", required: true  },
    ]);
    if (req.type === "Object" && !existAnno(paths, req, "@trans", "any")) {
      const urlValue = req.properties.find(v => v.key === "url").value as JsonaString;
      if (!existAnno(paths, urlValue, "trans", "any")) {
        const urlParamKeys =  _.uniq(urlValue.value.split("/").filter(v => /^\{\w+\}$/.test(v)).map(v => v.slice(1, -1)));
        if (urlParamKeys.length === 0) return;
        const paramsProp = req.properties.find(v => v.key === "params");
        if (!paramsProp) {
          throw new Error(`${paths.join(".")}: must have url params ${urlParamKeys.join(",")}`);
        }
        if (!existAnno(paths, req, "@anno", "any")) {
          const paramKeys = [];
          const paramsPropValue = paramsProp.value as JsonaObject;
          for (const prop of paramsPropValue.properties) {
            paramKeys.push(prop.key);
          }
          if (!_.isEqual(_.sortBy(urlParamKeys), _.sortBy(paramKeys))) {
            throw new Error(`${paths.concat(["params"]).join(".")}: should match url params${toPosString(paramsPropValue.position)}`);
          }
        }
      }
    }
  }

  private validateRes(paths: string[], res: JsonaValue) {
    if (!res) return;
    res.annotations.push(createAnno("partial", null));
    checkValue(paths, res, [
      { paths: [], type: "Object", required: true },
      { paths: ["status"], type: "Integer" },
      { paths: ["headers"], type: "Object" },
      { paths: ["headers", "*"], type: "Header", required: true },
    ]);
  }
}

function setProxy(opts: AxiosRequestConfig) {
  let useHttps = false;
  if (opts.url && opts.url.startsWith("https://")) {
    useHttps = true;
  }
  if (!useHttps && opts.baseURL && opts.baseURL.startsWith("https://")) {
    useHttps = true;
  }
  let proxy: string;
  if (typeof opts.proxy === "undefined") {
    if (process.env["NO_PROXY"] || process.env["no_proxy"]) return;
    if (useHttps) {
      proxy = process.env["HTTPS_PROXY"] || process.env["https_proxy"];
    } else {
      proxy = process.env["HTTP_PROXY"] || process.env["http_proxy"];
    }
  } else {
    proxy = opts.proxy as any;
  }
  if (!proxy) return;
  opts.proxy = false;
  if (useHttps) {
    opts.httpsAgent = new HttpsProxyAgent({ proxy });
  } else {
    opts.httpAgent = new HttpProxyAgent({ proxy });
  }
}
