import { Cell } from "./Cell";

export class CEmpty extends Cell {
  constructor() {
    super("Empty", false, false);
    this._backgroundColor = "#00000000";
    this._textureIndex = { x: 0, y: 0 };
  }

  public update(): void {
    //
  }
}
