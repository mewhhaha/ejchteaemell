import { annotate, into } from "playground/jsx-runtime";
import "./store.js";
import { md5 } from "./md5.js";

declare global {
  interface Window {
    dynamicAssets: Map<string, string>;
  }
}

const dynamicAssets = new Map<string, string>();
window.dynamicAssets = dynamicAssets;

export const handler = <T extends Record<string, unknown>>(
  fn: (event: Event | undefined, deps: T) => void,
  deps?: T,
) => {
  const serialized = fn.toString();

  const hash = md5(serialized);
  dynamicAssets.set(hash, serialized);

  return annotate(
    undefined,
    JSON.stringify({
      handler: hash,
      dependencies: deps,
    }),
  );
};

export const effect = <
  T extends Record<string, unknown> = Record<string, never>,
>(
  fn: (deps: T) => unknown,
  deps?: T,
) => {
  async function* generator() {
    const serialized = fn.toString();
    const hash = md5(serialized);
    dynamicAssets.set(hash, serialized);

    yield* `<!-- 
innerHTML="${JSON.stringify({
      effect: hash,
      dependencies: deps,
    })}";
-->`;

    const result = fn(deps ?? ({} as T));
    yield* (<>{result}</>).generator;
  }

  return into(generator());
};

export const useSignal = <T,>(value: T) => {
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
