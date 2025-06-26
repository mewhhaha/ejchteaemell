import { expect, test } from "vitest";
import { getByTestId } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import { renderHTML } from "../runtime/jsx-runtime.mts";
import { serializer } from "../runtime/serializer.mts";
import fs from "fs";
import path from "path";
import { clear, useSignal } from "../runtime/signal-context.mts";

function Counter() {
  const count = useSignal(0);

  return (
    <div>
      <h1>Interactive Counter</h1>
      <p data-testid="count">Count: {count}</p>
      <button data-testid="increment" onClick={() => count.value++}>
        +
      </button>
      <button data-testid="decrement" onClick={() => count.value--}>
        -
      </button>
      <button data-testid="reset" onClick={() => (count.value = 0)}>
        Reset
      </button>
    </div>
  );
}

test("user interactions work with real fx-client hydration", async () => {
  // Reset state
  serializer.reset();
  clear();

  // Generate HTML with state
  const html = renderHTML(<Counter />);

  // Load and execute the real client script
  const clientScript = fs.readFileSync(
    path.join(import.meta.dirname, "../public/fx-client.js"),
    "utf-8",
  );

  const script = `<script type="module" defer async >${clientScript}</script>`;

  // Set DOM content directly
  document.body.innerHTML = script + html;

  // Execute client script
  eval(clientScript);

  // Wait for hydration to complete
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Get elements
  const container = document.body;
  const countElement = getByTestId(container, "count");
  const incrementButton = getByTestId(container, "increment");
  const decrementButton = getByTestId(container, "decrement");
  const resetButton = getByTestId(container, "reset");

  // Setup user event
  const user = userEvent.setup({ document });

  // Verify initial state
  expect(countElement.textContent).toBe("Count: 0");

  // Test increment with user interaction
  await user.click(incrementButton);
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(countElement.textContent).toBe("Count: 1");

  // Test multiple increments
  await user.click(incrementButton);
  await user.click(incrementButton);
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(countElement.textContent).toBe("Count: 3");

  // Test decrement
  await user.click(decrementButton);
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(countElement.textContent).toBe("Count: 2");

  // Test reset
  await user.click(resetButton);
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(countElement.textContent).toBe("Count: 0");
});

test("multiple signals with user interactions", async () => {
  function MultiSignalComponent() {
    const count = useSignal(5);
    const name = useSignal("Alice");

    return (
      <div>
        <p data-testid="count-display">Count: {count}</p>
        <p data-testid="name-display">Name: {name}</p>
        <button data-testid="count-btn" onClick={() => count.value++}>
          +Count
        </button>
        <button
          data-testid="name-btn"
          onClick={() =>
            (name.value = name.value === "Alice" ? "Bob" : "Alice")
          }
        >
          Toggle Name
        </button>
      </div>
    );
  }

  // Reset state
  serializer.reset();
  clear();

  // Generate HTML
  const html = renderHTML(<MultiSignalComponent />);

  // Set DOM content directly
  document.body.innerHTML = html;

  // Load client script
  const clientScript = fs.readFileSync(
    path.join(import.meta.dirname, "../public/fx-client.js"),
    "utf-8",
  );
  eval(clientScript);

  await new Promise((resolve) => setTimeout(resolve, 100));

  // Setup user event
  const user = userEvent.setup({ document });

  // Get elements
  const container = document.body;
  const countDisplay = getByTestId(container, "count-display");
  const nameDisplay = getByTestId(container, "name-display");
  const countBtn = getByTestId(container, "count-btn");
  const nameBtn = getByTestId(container, "name-btn");

  // Verify initial state
  expect(countDisplay.textContent).toBe("Count: 5");
  expect(nameDisplay.textContent).toBe("Name: Alice");

  // Test count increment (should not affect name)
  await user.click(countBtn);
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(countDisplay.textContent).toBe("Count: 6");
  expect(nameDisplay.textContent).toBe("Name: Alice"); // unchanged

  // Test name toggle (should not affect count)
  await user.click(nameBtn);
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(countDisplay.textContent).toBe("Count: 6"); // unchanged
  expect(nameDisplay.textContent).toBe("Name: Bob");

  // Test multiple rapid clicks
  await user.click(countBtn);
  await user.click(countBtn);
  await user.click(nameBtn); // Should toggle back to Alice
  await new Promise((resolve) => setTimeout(resolve, 50));

  expect(countDisplay.textContent).toBe("Count: 8");
  expect(nameDisplay.textContent).toBe("Name: Alice");
});
