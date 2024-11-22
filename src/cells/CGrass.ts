import { Cell } from "./Cell";

export class CGrass extends Cell {
  constructor() {
    super("Grass", false, false);
    this._backgroundColor = "#4b4";
    this._textureIndex = { x: 1, y: 3 };
  }

  public update(): void {
    //
  }
}
