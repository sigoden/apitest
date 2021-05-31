import axios, { AxiosRequestConfig } from "axios";
import * as _ from "lodash";
import { Client } from ".";
import { Unit } from "../Cases";
import { toPosString } from "../Loader";
import { JsonaObject, JsonaValue } from "../types";

export default class HttpClient implements Client {
  private options: any;
  public constructor(options: any) {
    this.options = options;
  }
  public get name() {
    return "http";
  }

  public validate(unit: Unit) {
    this.validateReq(unit.paths.concat(["req"]), unit.req);
    this.validateRes(unit.paths.concat(["res"]), unit.res);
  }

  public async run(unit: Unit, req: any) {
    const opts: AxiosRequestConfig = {
      ...(this.options || {}),
      ...(unit.client.options || {}),
      url: req.url,
      method: req.method || "get",
    };
    if (req.query) {
      opts.params = req.query;
    }
    if (req.header) {
      opts.headers = req.header;
    }
    if (req.params) {
      for (const key in req.params) {
        opts.url = opts.url.replace(new RegExp(`{${key}}`, "g"), req.params[key]);
      }
    }
    if (req.body) {
      if (!(req.header && (req.header["content-type"] || req.header["Content-Type"]))) {
        _.set(opts, ["headers", "content-type"], "application/json; charset=utf-8");
      }
      opts.data = req.body;
    }
    const result = {} as any;
    let needHeader = false;
    let needStatus = false;
    if (unit.res) {
      const res_ = unit.res as JsonaObject;
      needHeader = !!res_.properties.find(v => v.key === "header");
      needStatus = !!res_.properties.find(v => v.key === "status");
    }
    try {
      const axiosRes = await axios(opts);
      if (needHeader) result.header = axiosRes.headers;
      if (needStatus) result.status = axiosRes.status;
      result.body = axiosRes.data;
    } catch (err) {
      if (err.response) {
        if (needHeader) result.header = err.response.headers;
        if (needStatus) result.status = err.response.status;
        result.body = err.response.data;
      } else {
        throw err;
      }
    }
    return result;
  }

  private validateReq(paths: string[], req: JsonaValue) {
    if (req.type !== "Object") {
      throw new Error(`${[paths.join(".")]} should be object value${toPosString(req.position)}`);
    }
    const urlProp = req.properties.find(v => v.key === "url");
    if (!urlProp) {
      throw new Error(`${[paths.concat(["url"]).join(".")]} is required${toPosString(req.position)}`);
    }
    if (urlProp.value.type !== "String") {
      throw new Error(`${[paths.concat(["url"]).join(".")]} should be string value${toPosString(urlProp.position)}`);
    }

    const urlParamKeys =  _.uniq(urlProp.value.value.split("/").filter(v => /^\{\w+\}$/.test(v)).map(v => v.slice(1, -1)));

    const methodProp = req.properties.find(v => v.key === "method");
    if (methodProp) {
      if (methodProp.value.type !== "String") {
        throw new Error(`${[paths.concat(["method"]).join(".")]} should be string value${toPosString(methodProp.position)}`);
      }
      const method = methodProp.value.value;
      if (["post", "get", "put", "delete", "patch"].indexOf(method) === -1) {
        throw new Error(`${[paths.concat(["method"]).join(".")]} is not valid http method${toPosString(methodProp.position)}`);
      }
    }

    const paramsProp = req.properties.find(v => v.key === "params");
    if (paramsProp) {
      if (paramsProp.value.type !== "Object") {
        throw new Error(`${[paths.concat(["params"]).join(".")]} should be object value${toPosString(paramsProp.position)}`);
      }
      const paramKeys = [];
      for (const prop of paramsProp.value.properties) {
        if (prop.value.type === "Object" || prop.value.type === "Array") {
          throw new Error(`${[paths.concat(["params"]).join(".")]} should be scalar value${toPosString(prop.position)}`);
        }
        paramKeys.push(prop.key);
      }
      if (!_.isEqual(_.sortBy(urlParamKeys), _.sortBy(paramKeys))) {
        throw new Error(`${[paths.concat(["params"]).join(".")]} should match url params${toPosString(paramsProp.position)}`);
      }
    } else {
      if (urlParamKeys.length > 0) {
        throw new Error(`${[paths]} must have url params ${urlParamKeys.join(",")}`);
      }
    }

    const headerProp = req.properties.find(v => v.key === "header");
    if (headerProp) {
      if (headerProp.value.type !== "Object") {
        throw new Error(`${[paths.concat(["header"]).join(".")]} should be object value${toPosString(headerProp.position)}`);
      }
      for (const prop of headerProp.value.properties) {
        if (prop.value.type === "Object" || prop.value.type === "Array") {
          throw new Error(`${[paths.concat(["params"]).join(".")]} should be scalar value${toPosString(prop.position)}`);
        }
      }
    }
    const queryProp = req.properties.find(v => v.key === "query");
    if (queryProp) {
      if (queryProp.value.type !== "Object") {
        throw new Error(`${[paths.concat(["query"]).join(".")]} should be object value${toPosString(queryProp.position)}`);
      }
    }
  }

  private validateRes(paths: string[], res: JsonaValue) {
    if (!res) return;
    if (res.type !== "Object") {
      throw new Error(`${[paths.join(".")]} should be object value${toPosString(res.position)}`);
    }
    const headerProp = res.properties.find(v => v.key === "header");
    if (headerProp) {
      if (headerProp.value.type !== "Object") {
        throw new Error(`${[paths.concat(["header"]).join(".")]} should be object value${toPosString(headerProp.position)}`);
      }
      for (const prop of headerProp.value.properties) {
        if (prop.value.type === "Object" || prop.value.type === "Array") {
          throw new Error(`${[paths.concat(["params"]).join(".")]} should be scalar value${toPosString(prop.position)}`);
        }
      }
    }
    const statusProp = res.properties.find(v => v.key === "status");
    if (statusProp) {
      if (statusProp.value.type !== "Integer") {
        throw new Error(`${[paths.concat(["status"]).join(".")]} should be integer value${toPosString(statusProp.position)}`);
      }
    }
  }
}
