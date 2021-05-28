import { JsonaProperty } from "./types";
import { toPosString } from "./utils";

export default class Cases {
  constructor() {

  }
  public async addProp(moduleName: string, prop: JsonaProperty) {
    if (prop.value.type !== "Object") {
      throw new Error(`[${moduleName}.${prop.key}] should have object value ${toPosString(prop.position)}`);
    }
    if (prop.value.properties.find(v => v.key === "group")) {
      
    }
  }
}
