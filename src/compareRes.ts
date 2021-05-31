import { Unit } from "./Cases";

export default function compareRes(unit: Unit, res: any): Promise<CompareFail> {
  return null;
}

export interface CompareFail {
  paths: string[];
  message: string;
}
