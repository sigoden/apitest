import { Position } from "./types";

export function toPosString(position: Position) {
  if (position.mixin) {
    return " at mixin";
  }
  return ` at line ${position.line} col ${position.col}`;
}
