interface SerializedStateV2 {
  id: string;
  type: "signal" | "computed" | "effect";
  value: any;
}

interface SerializedHandlerV2 {
  id: string;
  event: string;
  fn: string;
}

class SerializerV2 {
  private stateMap = new Map<string, SerializedStateV2>();
  private handlerMap = new Map<string, SerializedHandlerV2>();
  private idCounter = 0;

  generateId(): string {
    return `fx_v2_${this.idCounter++}`;
  }

  serializeState(state: any): string {
    const id = this.generateId();
    const serialized: SerializedStateV2 = {
      id,
      type: "signal",
      value: state.value,
    };
    this.stateMap.set(id, serialized);
    return id;
  }

  serializeHandler(fn: Function, event: string): string {
    const id = this.generateId();
    const serialized: SerializedHandlerV2 = {
      id,
      event,
      fn: fn.toString(),
    };
    this.handlerMap.set(id, serialized);
    return id;
  }

  getStateData(): Record<string, SerializedStateV2> {
    return Object.fromEntries(this.stateMap);
  }

  getHandlerData(): Record<string, SerializedHandlerV2> {
    return Object.fromEntries(this.handlerMap);
  }

  reset(): void {
    this.stateMap.clear();
    this.handlerMap.clear();
    this.idCounter = 0;
  }
}

export const serializerV2 = new SerializerV2();
