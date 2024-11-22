import { Direction } from "../../enums/Direction";
import { Cell } from "../Cell";
import { Vector2 } from "memview";

export abstract class CSnake extends Cell {
  protected _direction: Direction;
  public get direction(): Direction {
    return this._direction;
  }

  protected _nextPartPosition: Vector2 | undefined;
  public get nextPartPosition(): Vector2 | undefined {
    return this._nextPartPosition;
  }

  constructor(type: string) {
    super(type, true, false);
    this._backgroundColor = "#00000000";
    this._textureIndex = { x: 0, y: 0 };
    this._direction = Direction.Left;
  }

  public setNextPartPosition(nextPartPosition: Vector2 | null) {
    if (nextPartPosition) {
      this._nextPartPosition = nextPartPosition;
    }
  }
}
