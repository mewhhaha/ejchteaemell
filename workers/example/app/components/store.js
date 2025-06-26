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
let currentEffect = null;

function track(signal) {
  if (!usages.has(signal)) {
    usages.set(signal, []);
  }

  if (currentEffect) {
    usages.get(signal)?.push(currentEffect);
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
  const result = signal(undefined);
  effect(() => {
    result.value = callable();
  });
  return result;
}

const store = new Map();

const get = (ref) => {
  if (store.has(ref.id)) {
    return store.get(ref.id);
  }

  const s = signal(ref.value);
  store.set(ref.id, s);
  return s;
};

if (typeof window !== "undefined") {
  window.__store = { get };
}
