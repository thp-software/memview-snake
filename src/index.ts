import { Game } from "./Game";

(async () => {
  const game: Game = new Game();
  await game.init();

  // While(true) is acceptable as game.update() release the event loop with sleep()
  while (true) {
    await game.update();
  }
})();
