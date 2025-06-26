import { expect, test } from "vitest";
import { renderHTML } from "../runtime/jsx-runtime.mts";
import { serializer } from "../runtime/serializer.mts";
import { clear, useSignal } from "../runtime/signal-context.mts";

function Counter() {
  const count = useSignal(0);
  const name = useSignal("World");

  return (
    <div>
      <h1>Hello {name}!</h1>
      <p>Count: {count}</p>
      <button onClick={() => count.value++}>Increment</button>
      <button onClick={() => count.value--}>Decrement</button>
      <button onClick={() => (count.value = 0)}>Reset</button>
      <button
        onClick={() =>
          (name.value = name.value === "World" ? "React" : "World")
        }
      >
        Toggle Name
      </button>
    </div>
  );
}

test("clean React-like syntax with automatic closure capture", () => {
  serializer.reset();
  clear();

  const html = renderHTML(
    <html>
      <head>
        <title>FX Router Demo</title>
      </head>
      <body>
        <Counter />
      </body>
    </html>,
  );

  document.body.innerHTML = html;

  // Verify the HTML structure
  expect(html).toContain("Hello");
  expect(html).toContain("Count:");
  expect(html).toContain("World");
  expect(html).toContain("0");

  // Verify reactive elements are wrapped
  expect(html).toContain('<span id="fx_');

  // Verify event handlers are serialized
  expect(html).toContain("fx.invokeHandler");

  // Verify state serialization
  expect(html).toContain("fx:state:");

  // Verify handler serialization with injected signal access
  expect(html).toContain("fx.getSignal");

  // Verify binding comments for reactivity
  expect(html).toContain("fx:binding:");

  // Verify script inclusion
  expect(html).toContain('<script src="/fx-client.js">');

  console.log(
    "✅ Successfully generated resumable HTML with React-like syntax!",
  );
});
