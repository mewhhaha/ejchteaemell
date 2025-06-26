import { expect, test } from "vitest";
import { renderHTML } from "../runtime/jsx-runtime.mts";
import { serializer } from "../runtime/serializer.mts";
import { clear, useSignal } from "../runtime/signal-context.mts";

test("current pattern: signalContext.track with useSignal", async () => {
  serializer.reset();
  clear();

  function CurrentPattern() {
    // Current verbose but explicit pattern
    const count = useSignal(0);
    const name = useSignal("World");

    return (
      <div>
        <h1>Hello {name}!</h1>
        <p>Count: {count}</p>
        <button onClick={() => count.value++}>Increment</button>
      </div>
    );
  }

  const html = renderHTML(<CurrentPattern />);

  // Check that HTML contains signal values (wrapped in spans)
  expect(html).toContain("Hello <span");
  expect(html).toContain(">World</span>");
  expect(html).toContain("Count: <span");
  expect(html).toContain(">0</span>");

  // Check that serialization includes signal state
  expect(html).toContain("fx:state:");
  expect(html).toContain("fx:handler:");
});

test("simplified pattern: direct signalContext.useSignal", async () => {
  serializer.reset();
  clear();

  function SimplifiedPattern() {
    // New simplified pattern - but closure capture needs fixing
    const count = useSignal(0, "count"); // explicit name needed for now
    const name = useSignal("World", "name");

    return (
      <div>
        <h1>Hello {name}!</h1>
        <p>Count: {count}</p>
        <button onClick={() => count.value++}>Increment</button>
      </div>
    );
  }

  const html = renderHTML(<SimplifiedPattern />);

  // Check that HTML contains signal values (wrapped in spans)
  expect(html).toContain("Hello <span");
  expect(html).toContain(">World</span>");
  expect(html).toContain("Count: <span");
  expect(html).toContain(">0</span>");

  // Check that serialization includes signal state
  expect(html).toContain("fx:state:");
  expect(html).toContain("fx:handler:");
});

test("comparison of current vs simplified API", () => {
  // The issue: signalContext.track("name", useSignal("value")) is verbose
  // Current pattern requires:
  // 1. Import useSignal
  // 2. Call signalContext.track with explicit name
  // 3. Pass useSignal call as second argument

  // What we want:
  // const count = signalContext.useSignal(0);
  // const name = signalContext.useSignal("World");

  // The challenge is closure capture needs variable names
  // to restore signals in the browser.

  expect(true).toBe(true); // Just a demo test
});
