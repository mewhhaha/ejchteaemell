export type SignalValue<T> = {
  readonly __signal: true;
  readonly value: T;
  readonly id: string;
};

export type Signal<T> = {
  (): T;
  (newValue: T): void;
  readonly __signal: true;
  readonly id: string;
  subscribe(callback: (value: T) => void): () => void;
};

const signalRegistry = new Map<string, {
  value: any;
  subscribers: Set<(value: any) => void>;
}>();

export function signal<T>(initialValue: T): Signal<T> {
  const id = `signal-${crypto.randomUUID()}`;
  
  signalRegistry.set(id, {
    value: initialValue,
    subscribers: new Set(),
  });

  const signalFunction = ((newValue?: T) => {
    const entry = signalRegistry.get(id);
    if (!entry) return initialValue;

    if (arguments.length === 0) {
      return entry.value;
    }

    if (entry.value !== newValue) {
      entry.value = newValue;
      entry.subscribers.forEach(callback => callback(newValue as T));
    }
  }) as any;

  signalFunction.__signal = true;
  signalFunction.id = id;
  signalFunction.subscribe = (callback: (value: T) => void) => {
    const entry = signalRegistry.get(id);
    if (entry) {
      entry.subscribers.add(callback);
      return () => entry.subscribers.delete(callback);
    }
    return () => {};
  };

  return signalFunction;
}

export function computed<T>(fn: () => T): Signal<T> {
  const computedSignal = signal(fn());
  
  // In a real implementation, we'd track dependencies during fn() execution
  // For simplicity, we'll just re-compute on demand
  const originalGet = computedSignal;
  return Object.assign(
    () => fn(),
    {
      __signal: true as const,
      id: computedSignal.id,
      subscribe: computedSignal.subscribe,
    }
  );
}

export function isSignal(value: any): value is Signal<any> {
  return value && typeof value === 'function' && value.__signal === true;
}

export function getSignalValue<T>(value: T | Signal<T>): T {
  return isSignal(value) ? value() : value;
}

// Client-side signal value for safe serialization
export function signalRef<T>(signal: Signal<T>): SignalValue<T> {
  return {
    __signal: true,
    value: signal(),
    id: signal.id,
  };
}

// Get all active signals for client-side hydration
export function getActiveSignals(): Record<string, any> {
  const signals: Record<string, any> = {};
  for (const [id, entry] of signalRegistry) {
    signals[id] = entry.value;
  }
  return signals;
}

// Update a signal from client-side
export function updateSignal(id: string, value: any): void {
  const entry = signalRegistry.get(id);
  if (entry && entry.value !== value) {
    entry.value = value;
    entry.subscribers.forEach(callback => callback(value));
  }
}