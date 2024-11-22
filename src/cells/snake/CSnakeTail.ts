import { Direction } from "../../enums/Direction";
import { CSnake } from "./CSnake";

export class CSnakeTail extends CSnake {
  constructor() {
    super("SnakeTail");
    this._backgroundColor = "#00000000";
    this._textureIndex = { x: 1, y: 1 };
  }

  public update(): void {}

  public setDirection(directionToForwardPart: Direction) {
    switch (directionToForwardPart) {
      case Direction.Left: {
        this._textureIndex = { x: 3, y: 2 };
        break;
      }
      case Direction.Top: {
        this._textureIndex = { x: 4, y: 2 };
        break;
      }
      case Direction.Right: {
        this._textureIndex = { x: 5, y: 2 };
        break;
      }
      case Direction.Down: {
        this._textureIndex = { x: 6, y: 2 };
        break;
      }
    }
  }
}
