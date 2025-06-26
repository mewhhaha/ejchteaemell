import { into } from "@mewhhaha/fx-router/jsx-runtime";
import storeCode from "./store.js?raw";

export const signalSymbol = Symbol("signal");

export function createSignal<T>(originalValue: T): {
  id: string;
  value: T;
  [signalSymbol]: true;
} {
  return {
    id: crypto.randomUUID(),
    value: originalValue,
    [signalSymbol]: true,
  };
}

const isSignalReference = (
  value: unknown,
): value is { id: string; value: unknown; [signalSymbol]: true } => {
  return typeof value === "object" && value !== null && signalSymbol in value;
};

const fn = <E extends Event, T extends Record<string, unknown>>(
  handler: (event: E) => void,
  deps: T,
) => {
  let depsString = "";
  for (const [key, value] of Object.entries(deps)) {
    if (isSignalReference(value)) {
      depsString += `const ${key} = window.__store.get({ id: "${value.id}", value: JSON.parse("${JSON.stringify(value.value).replace(/"/g, '\\"')}") });`;
    } else {
      depsString += `const ${key} = ${JSON.stringify(value)};`;
    }
  }

  const serializedHandler = handler.toString();

  return `
  ${depsString}
  const handler = ${serializedHandler};
  handler(event);
  `;
};

const Store = () => {
  async function* f() {
    yield `
<script type="module">
${storeCode}
</script>
    `;
  }

  return into(f());
};

export function Example() {
  const countSignal = createSignal(0);

  return (
    <div class="flex flex-col gap-2">
      <button
        onClick={() => {
          countSignal.value = countSignal.value + 1;
        }}
      >
        Click me
      </button>
      <output>Hello the value is {countSignal}</output>
    </div>
  );
}
