import { Direction } from "src/enums/Direction";
import { CSnake } from "./CSnake";

export class CSnakeHead extends CSnake {
  constructor() {
    super("SnakeHead");
    this._backgroundColor = "#00000000";
    this._textureIndex = { x: 0, y: 0 };
  }

  public update(): void {
    switch (this.direction) {
      case Direction.Left: {
        this._textureIndex = { x: 1, y: 0 };
        break;
      }
      case Direction.Top: {
        this._textureIndex = { x: 2, y: 0 };
        break;
      }
      case Direction.Right: {
        this._textureIndex = { x: 3, y: 0 };
        break;
      }
      case Direction.Down: {
        this._textureIndex = { x: 4, y: 0 };
        break;
      }
    }
  }

  public setDirection(direction: Direction) {
    this._direction = direction;
  }
}
