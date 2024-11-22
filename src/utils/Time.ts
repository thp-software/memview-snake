export abstract class Time {
  private static _tick: number = 0;
  public static get tick(): number {
    return Time._tick;
  }

  public static incrementTick() {
    Time._tick++;
  }

  public static resetTick() {
    Time._tick = 0;
  }
}
