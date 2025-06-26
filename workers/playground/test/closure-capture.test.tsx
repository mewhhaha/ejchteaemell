import { expect, test } from "vitest";
import { renderHTML } from "../runtime/jsx-runtime.mts";
import { serializer } from "../runtime/serializer.mts";
import { clear, useSignal } from "../runtime/signal-context.mts";

function Counter() {
  const count = useSignal(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => count.value++}>+</button>
      <button onClick={() => count.value--}>-</button>
      <button onClick={() => (count.value = 0)}>Reset</button>
    </div>
  );
}

test("automatic closure capture works", () => {
  serializer.reset();
  clear();

  const html = renderHTML(
    <html>
      <body>
        <Counter />
      </body>
    </html>,
  );

  expect(html).toContain("Count:");
  expect(html).toContain('<span id="fx_');
  expect(html).toContain("fx.invokeHandler");
  expect(html).toContain("fx:state:");
  expect(html).toContain("fx:handler:");
  expect(html).toContain("fx:binding:");
  expect(html).toContain("fx.getSignal");
});
