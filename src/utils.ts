import { Position } from "./types";

export function toPosString(position: Position) {
  return `at line ${position.line} col ${position.col}`;
}
