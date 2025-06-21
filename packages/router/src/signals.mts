let signalId = 0;
let currentEffect: (() => void) | null = null;

export class Signal<T> {
  private value: T;
  private subscribers = new Set<() => void>();
  public readonly id: string = `s${++signalId}`;

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get(): T {
    if (currentEffect) {
      this.subscribers.add(currentEffect);
    }
    return this.value;
  }

  set(newValue: T): void {
    if (this.value !== newValue) {
      this.value = newValue;
      this.subscribers.forEach(fn => fn());
    }
  }

  update(updater: (value: T) => T): void {
    this.set(updater(this.value));
  }
}

export function signal<T>(initialValue: T): Signal<T> {
  return new Signal(initialValue);
}

export function computed<T>(fn: () => T): Signal<T> {
  const result = new Signal(fn());
  
  function recompute() {
    const oldEffect = currentEffect;
    currentEffect = recompute;
    result.set(fn());
    currentEffect = oldEffect;
  }
  
  currentEffect = recompute;
  fn();
  currentEffect = null;
  
  return result;
}

export function effect(fn: () => void): () => void {
  const oldEffect = currentEffect;
  currentEffect = fn;
  fn();
  currentEffect = oldEffect;
  
  return () => {
    if (currentEffect === fn) {
      currentEffect = null;
    }
  };
}

export function isSignal(value: unknown): value is Signal<unknown> {
  return value instanceof Signal;
}

export function serializeSignal(sig: Signal<unknown>): string {
  return JSON.stringify({
    id: sig.id,
    value: sig.get()
  });
}