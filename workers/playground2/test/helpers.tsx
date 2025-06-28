import { annotate, into, jsx, scopes } from "playground/jsx-runtime";
import "./store.js";
import { md5 } from "./md5.js";
import { isHtml } from "../runtime/node.mts";

declare global {
  interface Window {
    dynamicAssets: Map<string, Function>;
    __store: {
      get: (ref: { id: string; value: any }) => { value: any };
    };
    __signal: {
      signal: (value: any) => { value: any };
      effect: (fn: () => void) => void;
    };
  }
}

const dynamicAssets = new Map<string, Function>();
window.dynamicAssets = dynamicAssets;

export function handler(fn: (event: Event | undefined) => void) {
  const serialized = fn.toString();
  const dependencies = scopes.at(-1);

  const hash = md5(serialized);

  // Store the original function for deduplication
  dynamicAssets.set(hash, fn);

  return annotate(
    undefined,
    JSON.stringify({
      handler: hash,
      dependencies,
    }),
  );
}

export function effect(fn: () => unknown) {
  const serialized = fn.toString();
  const dependencies = scopes.at(-1);
  const hash = md5(serialized);

  // Store the original function for deduplication
  dynamicAssets.set(hash, fn);

  const eff = JSON.stringify({
    effect: hash,
    dependencies,
  });

  async function* generator() {
    yield* `<!-- 
innerHTML="${eff}";
-->`;

    const result = fn();
    if (result instanceof Promise) {
      yield* (await result).generator;
    } else if (isHtml(result)) {
      yield* result.generator;
    } else {
      yield <>{result}</>;
    }
  }

  return into(generator());
}

export type Signal<T> = {
  __isSignal: true;
  id: string;
  value: T;
};

export const useSignal = <T,>(initialValue: T): Signal<T> => {
  const ref = {
    __isSignal: true,
    id: crypto.randomUUID(),
    value: initialValue,
  };

  const actualSignal = window.__store.get(ref);

  return new Proxy(ref, {
    get(target, prop) {
      if (prop === "value") {
        return actualSignal.value;
      }
      return (target as any)[prop];
    },
    set(target, prop, value) {
      if (prop === "value") {
        actualSignal.value = value;
        return true;
      }
      (target as any)[prop] = value;
      return true;
    },
  }) as Signal<T>;
};
