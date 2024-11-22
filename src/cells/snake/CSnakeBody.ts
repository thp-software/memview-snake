import { Direction } from "src/enums/Direction";
import { CSnake } from "./CSnake";

export class CSnakeBody extends CSnake {
  constructor() {
    super("SnakeBody");
    this._backgroundColor = "#00000000";
    this._textureIndex = { x: 1, y: 1 };
  }

  public update(): void {}

  public setDirection(
    directionToForwardPart: Direction,
    directionToBackwardPart: Direction
  ) {
    // this._dataToDebug = [
    //   `${Direction[directionToForwardPart]} / ${Direction[directionToBackwardPart]}`,
    // ];
    switch (directionToForwardPart) {
      case Direction.Left: {
        switch (directionToBackwardPart) {
          case Direction.Left: {
            this._textureIndex = { x: 1, y: 1 };
            break;
          }
          case Direction.Top: {
            this._textureIndex = { x: 4, y: 1 };
            break;
          }
          case Direction.Right: {
            this._textureIndex = { x: 1, y: 1 };
            break;
          }
          case Direction.Down: {
            this._textureIndex = { x: 3, y: 1 };
            break;
          }
        }
        break;
      }
      case Direction.Top: {
        switch (directionToBackwardPart) {
          case Direction.Left: {
            this._textureIndex = { x: 4, y: 1 };
            break;
          }
          case Direction.Top: {
            this._textureIndex = { x: 1, y: 1 };
            break;
          }
          case Direction.Right: {
            this._textureIndex = { x: 1, y: 2 };
            break;
          }
          case Direction.Down: {
            this._textureIndex = { x: 2, y: 1 };
            break;
          }
        }
        break;
      }
      case Direction.Right: {
        switch (directionToBackwardPart) {
          case Direction.Left: {
            this._textureIndex = { x: 1, y: 1 };
            break;
          }
          case Direction.Top: {
            this._textureIndex = { x: 1, y: 2 };
            break;
          }
          case Direction.Right: {
            this._textureIndex = { x: 1, y: 1 };
            break;
          }
          case Direction.Down: {
            this._textureIndex = { x: 2, y: 2 };
            break;
          }
        }
        break;
      }
      case Direction.Down: {
        switch (directionToBackwardPart) {
          case Direction.Left: {
            this._textureIndex = { x: 3, y: 1 };
            break;
          }
          case Direction.Top: {
            this._textureIndex = { x: 2, y: 1 };
            break;
          }
          case Direction.Right: {
            this._textureIndex = { x: 2, y: 2 };
            break;
          }
          case Direction.Down: {
            this._textureIndex = { x: 1, y: 1 };
            break;
          }
        }
        break;
      }
    }
  }
}
