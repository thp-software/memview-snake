import { Vector2 } from "memview";
import { Cell } from "./Cell";
import { CTree } from "./CTree";
import { eventBus } from "../utils/EventBus";
import { Time } from "../utils/Time";
import { TreeState } from "src/enums/TreeState";

export class CApple extends Cell {
  private _createdAt: number;
  private _blinkTick: number;
  private _blinkState: boolean;
  constructor(position: Vector2) {
    super("Apple", false, true);
    this._backgroundColor = "#00000000";
    this._textureIndex = { x: 2, y: 3 };
    this._createdAt = Time.tick;
    this._blinkTick = 0;
    this._blinkState = false;
    this._position = position;
  }

  public update(): void {
    const delta = Time.tick - this._createdAt;
    if (delta >= 30 && delta < 60) {
      this._blinkTick++;
      if (this._blinkTick >= 5) {
        this._blinkTick = 0;
        this._blinkState = !this._blinkState;
      }
      if (this._blinkState) {
        this._backgroundColor = "#ff000070";
      } else {
        this._backgroundColor = "#00000000";
      }
    } else if (delta >= 60) {
      eventBus.emit("replace_apple_with_tree", {
        cell: new CTree(TreeState.Sapling),
        position: this._position,
        force: true,
      });
      eventBus.emit("block_emit_sound", {
        id: "te",
        ressourceId: "apple_to_sappling",
        volume: "1",
      });
    }
  }
}
