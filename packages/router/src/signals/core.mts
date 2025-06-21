type SignalId = string;
type Listener = () => void;

export interface Signal<T> {
  readonly id: SignalId;
  readonly value: T;
  set(value: T): void;
  subscribe(listener: Listener): () => void;
}

export interface ComputedSignal<T> extends Omit<Signal<T>, 'set'> {
  readonly computed: true;
}

const signals = new Map<SignalId, Signal<any>>();
const computedSignals = new Map<SignalId, ComputedSignal<any>>();
let signalIdCounter = 0;

function generateSignalId(): SignalId {
  return `signal_${++signalIdCounter}`;
}

export function signal<T>(initialValue: T): Signal<T> {
  const id = generateSignalId();
  const listeners = new Set<Listener>();
  
  let currentValue = initialValue;
  
  const sig: Signal<T> = {
    id,
    get value() {
      return currentValue;
    },
    set(value: T) {
      if (currentValue !== value) {
        currentValue = value;
        listeners.forEach(listener => listener());
      }
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
  
  signals.set(id, sig);
  return sig;
}

export function computed<T>(computeFn: () => T): ComputedSignal<T> {
  const id = generateSignalId();
  const listeners = new Set<Listener>();
  
  let currentValue = computeFn();
  let isStale = false;
  
  const sig: ComputedSignal<T> = {
    id,
    computed: true,
    get value() {
      if (isStale) {
        currentValue = computeFn();
        isStale = false;
      }
      return currentValue;
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
  
  computedSignals.set(id, sig);
  return sig;
}

export function effect(effectFn: () => void): void {
  effectFn();
}

export function getSignalById(id: SignalId): Signal<any> | ComputedSignal<any> | undefined {
  return signals.get(id) || computedSignals.get(id);
}

export function serializeSignals(): Record<SignalId, any> {
  const state: Record<SignalId, any> = {};
  signals.forEach((signal, id) => {
    state[id] = signal.value;
  });
  return state;
}

export function hydrateSignals(state: Record<SignalId, any>): void {
  Object.entries(state).forEach(([id, value]) => {
    const signal = signals.get(id);
    if (signal) {
      signal.set(value);
    }
  });
}