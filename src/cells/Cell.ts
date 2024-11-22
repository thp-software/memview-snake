import { Vector2 } from "memview";

export abstract class Cell {
  protected _position: Vector2;
  public get position(): Vector2 {
    return this._position;
  }

  protected _backgroundColor: string;
  public get backgroundColor(): string {
    return this._backgroundColor;
  }

  protected _textureIndex: Vector2;
  public get textureIndex(): Vector2 {
    return this._textureIndex;
  }

  protected _isCollidable: boolean;
  public get isCollidable(): boolean {
    return this._isCollidable;
  }

  protected _isCollectable: boolean;
  public get isCollectable(): boolean {
    return this._isCollectable;
  }

  protected _type: string;
  public get type(): string {
    return this._type;
  }

  protected _replaceWith: Cell | null = null;
  public get replaceWith(): Cell | null {
    return this._replaceWith;
  }

  // As MemView render mapper dont handle element inheritance,
  // we can use here a variable from parent class to debug data.
  protected _dataToDebug: string[];
  public get dataToDebug(): string[] {
    return this._dataToDebug;
  }

  constructor(type: string, isCollidable: boolean, isCollectable: boolean) {
    this._type = type;
    this._backgroundColor = "000000ff";
    this._textureIndex = { x: 0, y: 0 };
    this._isCollidable = isCollidable;
    this._isCollectable = isCollectable;
    this._dataToDebug = [];
    this._position = { x: 0, y: 0 };
  }

  public abstract update(): void;
}
