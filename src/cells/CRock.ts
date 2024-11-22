import { Cell } from "./Cell";

export class CRock extends Cell {
  constructor() {
    super("Rock", true, false);
    this._backgroundColor = "#00000000";
    this._textureIndex = { x: 6, y: 3 };
  }

  public update(): void {
    //
  }
}
