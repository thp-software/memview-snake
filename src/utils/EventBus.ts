import EventEmitter from "eventemitter3";

class EventBus extends EventEmitter {
  private static instance: EventBus;

  private constructor() {
    super();
  }

  public static getInstance(): EventBus {
    if (!this.instance) {
      this.instance = new EventBus();
    }
    return this.instance;
  }
}

export const eventBus = EventBus.getInstance();

export default EventBus;
