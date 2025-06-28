import { annotate, into, scopes } from "playground/jsx-runtime";
import "./store.js";
import { md5 } from "./md5.js";

declare global {
  interface Window {
    dynamicAssets: Map<string, string>;
  }
}

const dynamicAssets = new Map<string, string>();
window.dynamicAssets = dynamicAssets;

export function handler(fn: (event: Event | undefined) => void) {
  const serialized = fn.toString();

  const hash = md5(serialized);
  dynamicAssets.set(hash, serialized);

  return annotate(
    undefined,
    JSON.stringify({
      handler: hash,
      dependencies: scopes.at(-1),
    }),
  );
}

export function effect(fn: () => unknown) {
  const serialized = fn.toString();
  const hash = md5(serialized);
  dynamicAssets.set(hash, serialized);

  const eff = JSON.stringify({
    effect: hash,
    dependencies: scopes.at(-1),
  });

  async function* generator() {
    yield* `<!-- 
innerHTML="${eff}";
-->`;

    const result = fn();
    yield* (<>{result}</>).generator;
  }

  return into(generator());
}

export type Signal<T> = {
  __isSignal: true;
  id: string;
  value: T;
};

export const useSignal = <T,>(value: T): Signal<T> => {
  return {
    __isSignal: true,
    id: crypto.randomUUID(),
    set value(value: T) {
      this.value = value;
    },
    get value() {
      return value;
    },
  };
};
