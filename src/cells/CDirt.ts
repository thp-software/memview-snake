import { Cell } from "./Cell";

export class CDirt extends Cell {
  constructor() {
    super("Dirt", false, false);
    this._backgroundColor = "#BA8051";
    this._textureIndex = { x: 1, y: 3 };
  }

  public update(): void {
    //
  }
}
