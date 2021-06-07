import axios, { AxiosRequestConfig } from "axios";
import * as _ from "lodash";
import * as qs from "querystring";
import * as FormData from "form-data";
import { Client } from ".";
import { Unit } from "../Cases";
import { checkValue, existAnno, schemaValidate, toPosString } from "../utils";
import { JsonaObject, JsonaString, JsonaValue } from "jsona-js";

export interface HttpClientOptions {
  baseUrl?: string;
  timeout?: number;
  withCredentials?: boolean;
  headers?: Record<string, string>;
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
    withCredentials: {
      type: "boolean",
    },
    headers: {
      type: "object",
      anyProperties: {
        type: "string",
      },
    },
  },
};


export default class HttpClient implements Client {
  private options: HttpClientOptions;
  public constructor(name: string, options: any) {
    if (options) {
      try {
        schemaValidate(options, [], HTTP_OPTIONS_SCHEMA, true);
        this.options = _.pick(options, ["baseURL", "timeout", "withCredentials", "headers"]);
      } catch (err) {
        throw new Error(`[main@client(${name})[${err.paths.join(".")}] ${err.message}`);
      }
    } else {
      this.options = {};
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
      if (!reqContentType) reqContentType =  _.get(opts, ["headers", "content-type"], _.get(opts, ["headers", "Content-Type"]));
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
    const result = {} as any;
    let needHeader = false;
    let needStatus = false;
    if (unit.res) {
      const res_ = unit.res as JsonaObject;
      needHeader = !!res_.properties.find(v => v.key === "headers");
      needStatus = !!res_.properties.find(v => v.key === "status");
    }
    try {
      const axiosRes = await axios(opts);
      if (needHeader) result.headers = axiosRes.headers;
      if (needStatus) result.status = axiosRes.status;
      result.body = axiosRes.data;
    } catch (err) {
      if (err.response) {
        if (needHeader) result.headers = err.response.headers;
        if (needStatus) result.status = err.response.status;
        result.body = err.response.data;
      } else {
        throw err;
      }
    }
    return result;
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
    checkValue(paths, res, [
      { paths: [], type: "Object", required: true },
      { paths: ["status"], type: "Integer" },
      { paths: ["headers"], type: "Object" },
      { paths: ["headers", "*"], type: "Scalar", required: true },
    ]);
  }
}
