import { Time } from "src/utils/Time";
import { Cell } from "./Cell";
import { TreeState } from "src/enums/TreeState";

export class CTree extends Cell {
  private _lastStateUpdate: number;
  private _state: TreeState;
  private _adultLifetime: number;

  constructor(initialState: TreeState) {
    super("Tree", false, false);
    this._state = initialState;
    this._isCollidable = this._state === TreeState.Grown;
    this._adultLifetime = Math.floor(Math.random() * 2400 + 400);
    this._lastStateUpdate = Time.tick;
    this._backgroundColor = "#00000000";
    this.setSprite();
  }

  public update(): void {
    const delta = performance.now() - this._lastStateUpdate;

    if (
      this._state === TreeState.Sapling &&
      Time.tick - this._lastStateUpdate >= 30
    ) {
      this._state = TreeState.Grown;
      this._lastStateUpdate = Time.tick;
      this._isCollidable = true;
      this.setSprite();
    }

    if (
      this._state === TreeState.Grown &&
      Time.tick - this._lastStateUpdate >= this._adultLifetime
    ) {
      this._state = TreeState.Dead;
      this._lastStateUpdate = Time.tick;
      this._isCollidable = false;
      this.setSprite();
    }
  }

  private setSprite() {
    switch (this._state) {
      case TreeState.Sapling: {
        this._textureIndex = { x: 3, y: 3 };
        break;
      }
      case TreeState.Grown: {
        this._textureIndex = { x: 4, y: 3 };
        break;
      }
      case TreeState.Dead: {
        this._textureIndex = { x: 5, y: 3 };
        break;
      }
    }
  }
}
