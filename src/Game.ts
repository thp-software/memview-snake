import { Anchor, KeyCode, MemView, Vector2, Zoom } from "memview";

import { Time } from "./utils/Time";
import { eventBus } from "./utils/EventBus";
import { Direction } from "./enums/Direction";

import { Cell } from "./cells/Cell";
import { CGrass } from "./cells/CGrass";
import { CApple } from "./cells/CApple";
import { CEmpty } from "./cells/CEmpty";
import { CSnakeHead } from "./cells/snake/CSnakeHead";
import { CSnakeBody } from "./cells/snake/CSnakeBody";
import { CSnake } from "./cells/snake/CSnake";
import { CSnakeTail } from "./cells/snake/CSnakeTail";
import { CTree } from "./cells/CTree";
import { CRock } from "./cells/CRock";
import { TreeState } from "./enums/TreeState";
import { Random } from "./utils/Random";

export class Game {
  // MemView instance
  private mem = new MemView();

  // World array (terrain level)
  private worldTerrain: Cell[] = [];
  // World array (block level)
  private worldBlock: Cell[] = [];
  // Size of the world
  private worldSize: Vector2;

  // Direction of the snake
  private snakeDirection: Direction = Direction.Right;
  // Parts of the body of the snake
  private snakeParts: { position: Vector2; part: CSnake }[] = [];

  // Snake status for the display
  private snakeStatus: string = "";
  private lastStatusUpdate: number = 0;

  // Score
  private score: number = 0;

  // Is game over
  private isGameOver: boolean = false;
  // Is game paused
  private isPaused: boolean = false;

  // Time per update (milliseconds)
  private tickDelta: number = 100; // 100 ms = 10 fps

  constructor() {
    this.worldSize = { x: 24, y: 13 };
    this.bindEventBus();
  }

  /**
   * Called only one time, at the very beggining.
   */
  public async init() {
    // Start MemView
    await this.mem.start({
      openNewTab: true,
      waitForTab: true,
      autoOrder: "None",
      showSideBar: false,
      showConsole: false,
      showCursor: false,
      lockDrag: true,
      lockZoom: true,
      renderOptions: {
        bitmapViewThreshold: Zoom.Divide16,
        textureDisplayThreshold: Zoom.Divide8,
        gridDisplayThreshold: Zoom.Multiply8,
        textDisplayThreshold: Zoom.Multiply8,
      },
    });

    // Set view position and zoom
    this.mem.setView({
      position: { x: 12, y: 6 },
      zoom: Zoom.Divide2,
      handleResize: true,
    });

    // Load textures atlas
    await this.mem.loadAtlas(
      __dirname + "/../assets/textures/atlas.png",
      { x: 8, y: 8 },
      { x: 8, y: 8 }
    );

    // Load musics and fx
    await this.mem.loadAudio(
      "background_music",
      __dirname + "/../assets/musics/8_bit_adventure.ogg"
    );
    await this.mem.loadAudio(
      "death_music",
      __dirname + "/../assets/musics/8_bit_nostalgia.ogg"
    );

    await this.mem.loadAudio(
      "eat_apple",
      __dirname + "/../assets/fx/eat_apple.ogg"
    );
    await this.mem.loadAudio("death", __dirname + "/../assets/fx/death.ogg");
    await this.mem.loadAudio(
      "chop_sappling",
      __dirname + "/../assets/fx/chop_sappling.ogg"
    );
    await this.mem.loadAudio(
      "apple_to_sappling",
      __dirname + "/../assets/fx/apple_to_sappling.ogg"
    );

    await this.start();
  }

  /**
   * Call at start/restart
   */
  public async start() {
    Time.resetTick();

    this.mem.stopAudio("death_music_1");

    this.mem.playAudio("background_music_1", "background_music", {
      volume: 0.1,
      loop: true,
    });

    this.worldTerrain = Array.from<Cell>({
      length: this.worldSize.x * this.worldSize.y,
    }).fill(new CGrass());

    // Draw the terrain level only once
    await this.mem.log2dFlat(
      "world_terrain",
      this.worldTerrain,
      this.worldSize,
      {
        isSync: true,
        mapper: {
          cellBackgroundColor: (el) => {
            return el._backgroundColor;
          },
          cellText: (el) => {
            return [];
          },
          cellAtlasIndex: (el) => {
            return el._textureIndex;
          },
          details: (el) => {
            return [];
          },
        },
      }
    );

    this.worldBlock = Array.from<Cell>({
      length: this.worldSize.x * this.worldSize.y,
    }).fill(new CEmpty());

    this.snakeParts = [
      { position: { x: 5, y: 2 }, part: new CSnakeHead() },
      { position: { x: 4, y: 2 }, part: new CSnakeBody() },
      { position: { x: 3, y: 2 }, part: new CSnakeBody() },
      { position: { x: 2, y: 2 }, part: new CSnakeTail() },
    ];

    this.snakeDirection = Direction.Right;

    this.generateWorld(10, 3);

    this.isGameOver = false;

    this.score = 0;

    this.placeFood();

    this.applyDirectionToSnake();

    this.applySnakeInWorld();

    this.updateWorld();

    await this.updateSnake();

    await this.render();

    this.snakeStatus = "3";
    this.renderDisplay();
    await this.sleep(1000);
    this.snakeStatus = "2";
    this.renderDisplay();
    await this.sleep(1000);
    this.snakeStatus = "1";
    this.renderDisplay();
    await this.sleep(1000);
  }

  /**
   * Main Loop
   */
  public async update() {
    let start: number = performance.now();
    // If the game is in GameOver state
    if (this.isGameOver) {
      // If the player want to restart the game
      if (this.mem.getKey(KeyCode.KeyR)) {
        // Init the game
        await this.start();
      }
    } else {
      if (performance.now() - this.lastStatusUpdate >= 500) {
        this.snakeStatus = "🐍";
      }

      // Check if player want to pause the game
      if (this.mem.getKey(KeyCode.KeyP)) {
        this.isPaused = !this.isPaused;
      }

      // If the game is not paused
      if (!this.isPaused) {
        // Process keyboard inputs
        this.processInputs();

        // Move snake
        this.updateSnake();

        // Update world block/terrain
        this.updateWorld();
      }
    }
    // Render the world
    await this.render();

    // Sleep to get target deltaTime and release event loop.
    await this.sleep(this.tickDelta - (performance.now() - start));

    // Increment world tick
    Time.incrementTick();
  }

  private updateWorld() {
    for (let iY = 0; iY < this.worldSize.y; iY++) {
      for (let iX = 0; iX < this.worldSize.x; iX++) {
        this.worldTerrain[iX + this.worldSize.x * iY].update();
        this.worldBlock[iX + this.worldSize.x * iY].update();
      }
    }
  }

  private updateSnake() {
    // Clear snake from world
    for (let i = 0; i < this.snakeParts.length; i++) {
      this.worldBlock[
        this.snakeParts[i].position.x +
          this.worldSize.x * this.snakeParts[i].position.y
      ] = new CEmpty();
    }

    let snakeHeadPositionBeforeUpdate: Vector2 = this.snakeParts[0].position;
    let newPosition: Vector2;

    // Move head according to direction
    switch (this.snakeDirection) {
      case Direction.Left: {
        newPosition = {
          x: snakeHeadPositionBeforeUpdate.x - 1,
          y: snakeHeadPositionBeforeUpdate.y,
        };
        break;
      }
      case Direction.Top: {
        newPosition = {
          x: snakeHeadPositionBeforeUpdate.x,
          y: snakeHeadPositionBeforeUpdate.y - 1,
        };
        break;
      }
      case Direction.Right: {
        newPosition = {
          x: snakeHeadPositionBeforeUpdate.x + 1,
          y: snakeHeadPositionBeforeUpdate.y,
        };
        break;
      }
      case Direction.Down: {
        newPosition = {
          x: snakeHeadPositionBeforeUpdate.x,
          y: snakeHeadPositionBeforeUpdate.y + 1,
        };
        break;
      }
    }

    // Check if snake is on edge, and TP it
    if (newPosition.x >= this.worldSize.x) {
      newPosition.x = 0;
    }
    if (newPosition.y >= this.worldSize.y) {
      newPosition.y = 0;
    }
    if (newPosition.x < 0) {
      newPosition.x = this.worldSize.x - 1;
    }
    if (newPosition.y < 0) {
      newPosition.y = this.worldSize.y - 1;
    }

    // Snake hit collidable
    if (
      this.worldBlock[newPosition.x + this.worldSize.x * newPosition.y]
        .isCollidable
    ) {
      this.gameOver();
    } else {
      const find = this.snakeParts.find(
        (el) =>
          el.position.x === newPosition.x && el.position.y === newPosition.y
      );
      // Snake hit itself
      if (find) {
        this.gameOver();
      } else {
        let hasEat: boolean = false;

        // Snake hit collectable
        if (
          this.worldBlock[newPosition.x + this.worldSize.x * newPosition.y]
            .isCollectable
        ) {
          this.eatApple();
          hasEat = true;
        } else if (
          this.worldBlock[
            newPosition.x + this.worldSize.x * newPosition.y
          ] instanceof CTree
        ) {
          this.chopTree();
        }

        // Move snake according to head
        let previousPosition = { ...this.snakeParts[0].position };

        for (let i = 1; i < this.snakeParts.length; i++) {
          const currentPosition = { ...this.snakeParts[i].position };

          this.snakeParts[i].position = previousPosition;

          previousPosition = currentPosition;
        }
        this.snakeParts[0].position = newPosition;

        // If snake eat, add a part
        if (hasEat) {
          this.snakeParts.splice(this.snakeParts.length - 1, 0, {
            position: previousPosition,
            part: new CSnakeBody(),
          });
        }
      }
    }

    this.applyDirectionToSnake();
    this.applySnakeInWorld();
  }

  private gameOver() {
    this.isGameOver = true;
    this.snakeStatus = "💀";

    this.mem.stopAudio("background_music_1");
    this.mem.playAudio("death_music_1", "death_music", {
      volume: 0.1,
      loop: true,
    });
    this.mem.playAudio("death_1", "death", {
      volume: 0.1,
      loop: false,
    });
  }

  private eatApple() {
    this.placeFood();
    this.snakeStatus = "🍴";
    this.score += 7;
    this.lastStatusUpdate = performance.now();

    this.mem.playAudio("eat_apple_1", "eat_apple", {
      volume: 0.1,
      loop: false,
    });
  }

  private chopTree() {
    this.snakeStatus = "🪓";
    this.lastStatusUpdate = performance.now();
    this.score += 2;
  }

  /**
   * Apply direction to each snake parts in the world
   */
  private applyDirectionToSnake() {
    for (let i = 0; i < this.snakeParts.length; i++) {
      // If part is head
      if (i === 0) {
        (this.snakeParts[i].part as CSnakeHead).setDirection(
          this.snakeDirection
        );
        // If part is tail
      } else if (i === this.snakeParts.length - 1) {
        (this.snakeParts[i].part as CSnakeTail).setDirection(
          this.getDirection(
            this.snakeParts[i].position,
            this.snakeParts[i - 1].position
          )
        );
        // If part is body
      } else {
        (this.snakeParts[i].part as CSnakeBody).setDirection(
          this.getDirection(
            this.snakeParts[i].position,
            this.snakeParts[i - 1].position
          ),
          this.getDirection(
            this.snakeParts[i].position,
            this.snakeParts[i + 1].position
          )
        );
      }
    }
  }

  /**
   * Apply snake parts into world at block level
   */
  private applySnakeInWorld() {
    for (let i = 0; i < this.snakeParts.length; i++) {
      this.worldBlock[
        this.snakeParts[i].position.x +
          this.worldSize.x * this.snakeParts[i].position.y
      ] = this.snakeParts[i].part;
    }
  }

  /**
   * Get direction between 2 vectors
   */
  private getDirection(from: Vector2, to: Vector2): Direction {
    const mapWidth = this.worldSize.x;
    const mapHeight = this.worldSize.y;

    let dx = to.x - from.x;
    let dy = to.y - from.y;

    if (Math.abs(dx) > mapWidth / 2) {
      dx = dx > 0 ? dx - mapWidth : dx + mapWidth;
    }

    if (Math.abs(dy) > mapHeight / 2) {
      dy = dy > 0 ? dy - mapHeight : dy + mapHeight;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? Direction.Right : Direction.Left;
    } else {
      return dy > 0 ? Direction.Down : Direction.Top;
    }
  }

  /**
   * Process Keyboard inputs
   */
  private processInputs() {
    switch (this.snakeDirection) {
      case Direction.Left: {
        if (this.mem.getKey(KeyCode.KeyW) || this.mem.getKey(KeyCode.ArrowUp)) {
          this.snakeDirection = Direction.Top;
        } else if (
          this.mem.getKey(KeyCode.KeyS) ||
          this.mem.getKey(KeyCode.ArrowDown)
        ) {
          this.snakeDirection = Direction.Down;
        }
        break;
      }
      case Direction.Top: {
        if (
          this.mem.getKey(KeyCode.KeyA) ||
          this.mem.getKey(KeyCode.ArrowLeft)
        ) {
          this.snakeDirection = Direction.Left;
        } else if (
          this.mem.getKey(KeyCode.KeyD) ||
          this.mem.getKey(KeyCode.ArrowRight)
        ) {
          this.snakeDirection = Direction.Right;
        }
        break;
      }
      case Direction.Right: {
        if (this.mem.getKey(KeyCode.KeyW) || this.mem.getKey(KeyCode.ArrowUp)) {
          this.snakeDirection = Direction.Top;
        } else if (
          this.mem.getKey(KeyCode.KeyS) ||
          this.mem.getKey(KeyCode.ArrowDown)
        ) {
          this.snakeDirection = Direction.Down;
        }
        break;
      }
      case Direction.Down: {
        if (
          this.mem.getKey(KeyCode.KeyA) ||
          this.mem.getKey(KeyCode.ArrowLeft)
        ) {
          this.snakeDirection = Direction.Left;
        } else if (
          this.mem.getKey(KeyCode.KeyD) ||
          this.mem.getKey(KeyCode.ArrowRight)
        ) {
          this.snakeDirection = Direction.Right;
        }
        break;
      }
    }
  }

  /**
   * Place food in world
   */
  private placeFood() {
    let foodPlaced: boolean = false;
    while (!foodPlaced) {
      let position: Vector2 = {
        x: Random.RangeInt(0, this.worldSize.x - 1),
        y: Random.RangeInt(0, this.worldSize.y - 1),
      };

      for (let i = 0; i < this.snakeParts.length; i++) {
        if (
          this.snakeParts[i].position.x === position.x &&
          this.snakeParts[i].position.y === position.y
        ) {
          continue;
        }
      }

      if (
        this.worldBlock[position.x + this.worldSize.x * position.y] instanceof
        CEmpty
      ) {
        this.worldBlock[position.x + this.worldSize.x * position.y] =
          new CApple({ x: position.x, y: position.y });
        foodPlaced = true;
      }
    }
  }

  private generateWorld(objectCount: number, minDistance: number) {
    const isPositionValid = (x: number, y: number): boolean => {
      if (this.snakeParts[0].position.y === y) {
        return false;
      }
      for (
        let i = Math.max(0, x - minDistance);
        i <= Math.min(this.worldSize.x - 1, x + minDistance);
        i++
      ) {
        for (
          let j = Math.max(0, y - minDistance);
          j <= Math.min(this.worldSize.y - 1, y + minDistance);
          j++
        ) {
          if (
            this.worldBlock[i + this.worldSize.x * j] instanceof CTree ||
            this.worldBlock[i + this.worldSize.x * j] instanceof CRock
          ) {
            return false;
          }
        }
      }
      return true;
    };

    let placedObjects = 0;
    while (placedObjects < objectCount) {
      const x = Random.RangeInt(0, this.worldSize.x - 1);
      const y = Random.RangeInt(0, this.worldSize.y - 1);

      if (
        this.worldBlock[x + this.worldSize.x * y] instanceof CEmpty &&
        isPositionValid(x, y)
      ) {
        if (Math.random() > 0.4) {
          this.worldBlock[x + this.worldSize.x * y] = new CTree(
            Random.RangeInt(0, 100) > 80 ? TreeState.Dead : TreeState.Grown
          );
        } else {
          this.worldBlock[x + this.worldSize.x * y] = new CRock();
        }
        placedObjects++;
      }
    }
  }

  /**
   * Render
   */
  private async render() {
    this.renderArrays();
    this.renderDisplay();
  }

  /**
   * Render world
   */
  private async renderArrays() {
    await this.mem.log2dFlat("world_block", this.worldBlock, this.worldSize, {
      position: { x: 0, y: 0 },
      isSync: true,
      mapper: {
        cellBackgroundColor: (el) => {
          return el._backgroundColor;
        },
        cellText: (el) => {
          return [
            {
              color: "white",
              fontSize: 8,
              anchor: Anchor.Center,
              text: `${el._dataToDebug}`,
            },
          ];
        },
        cellAtlasIndex: (el) => {
          return el._textureIndex;
        },
        details: (el) => {
          return [el._type];
        },
      },
    });
  }

  /**
   * Render display to monitor game state
   */
  private async renderDisplay() {
    await this.mem.logDisplay(
      "game_display",
      { x: 6, y: 12 },
      {
        position: { x: 25 * 64, y: 0 },
        backgroundColor: "#303030",
        elements: [
          {
            type: "Div",
            backgroundColor: "#454545",
            position: { x: 4, y: 4 },
            size: { x: 376, y: 760 },
          },
          {
            type: "Div",
            backgroundColor: "#779",
            position: { x: 12, y: 54 },
            size: { x: 358, y: 6 },
          },
          {
            type: "Text",
            color: "#ddd",
            position: { x: 192, y: 10 },
            value: "MemView Snake",
            fontSize: 50,
            alignement: "center",
          },

          {
            type: "Text",
            color: "#ddd",
            position: { x: 10, y: 580 },
            value: "Controls:",
            fontSize: 38,
            alignement: "left",
          },
          {
            type: "Text",
            color: "#ddd",
            position: { x: 10, y: 630 },
            value: "WASD / ZQSD / Arrows",
            fontSize: 32,
            alignement: "left",
          },
          {
            type: "Text",
            color: "#ddd",
            position: { x: 10, y: 670 },
            value: "[R]estart",
            fontSize: 32,
            alignement: "left",
          },
          {
            type: "Text",
            color: "#ddd",
            position: { x: 10, y: 710 },
            value: "[P]ause / Resume",
            fontSize: 32,
            alignement: "left",
          },
          {
            type: "Text",
            color: this.isGameOver ? "#f44" : "#00000000",
            position: { x: 192, y: 400 },
            value: "Game Over",
            fontSize: 60,
            alignement: "center",
          },
          {
            type: "Text",
            color: this.isPaused ? "#f93" : "#00000000",
            position: { x: 192, y: 400 },
            value: "Paused",
            fontSize: 60,
            alignement: "center",
          },
          {
            type: "Text",
            color: "#ffffff",
            position: { x: 192, y: 120 },
            value: this.snakeStatus,
            fontSize: 90,
            alignement: "center",
          },
          {
            type: "Text",
            color: "#ffffff",
            position: { x: 10, y: 250 },
            value: "Score:",
            fontSize: 50,
            alignement: "left",
          },
          {
            type: "Text",
            color: "#bbf",
            position: { x: 230, y: 250 },
            value: `${this.score}`,
            fontSize: 50,
            alignement: "left",
          },
        ],
      }
    );
  }

  private bindEventBus() {
    // Triggered by an apple that transform into a tree
    eventBus.on("replace_apple_with_tree", (data) => {
      if (
        this.worldBlock[
          data.position.x + this.worldSize.x * data.position.y
        ] instanceof CApple
      ) {
        this.worldBlock[data.position.x + this.worldSize.x * data.position.y] =
          data.cell;
        this.placeFood();
      }
    });

    eventBus.on("block_emit_sound", (data) => {
      this.mem.playAudio(data.id, data.ressourceId, data.volume);
    });
  }

  private async sleep(time: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, time));
  }
}
