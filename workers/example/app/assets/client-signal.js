export function signal(value) {
  return {
    get value() {
      track(this);
      return value;
    },

    set value(newValue) {
      value = newValue;
      execute(this);
    },
  };
}

const usages = new WeakMap();
let currentEffect;

function track(signal) {
  if (!usages.has(signal)) {
    usages.set(signal, []);
  }

  if (currentEffect) {
    usages.get(signal).push(currentEffect);
  }
}

function execute(signal) {
  usages.get(signal)?.forEach((callable) => callable());
}

export function effect(callable) {
  currentEffect = callable;
  callable();
  currentEffect = null;
}

export function computed(callable) {
  const result = signal();
  effect(() => {
    result.value = callable();
  });
  return result;
}

class ClientSignal {
  constructor() {
    this.signal = new Signal();
  }

  emit(event, ...args) {
    this.signal.emit(event, ...args);
  }
}

window.customElements.define('client-signal', ClientSignal);
