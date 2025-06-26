import { expect, test } from "vitest";
import { getByTestId } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import { renderHTML } from "../runtime/jsx-runtime.mts";
import { serializer } from "../runtime/serializer.mts";
import fs from "fs";
import path from "path";
import { clear, useSignal } from "../runtime/signal-context.mts";

function EventDemoComponent() {
  const message = useSignal("Not submitted");
  const clickCount = useSignal(0);

  return (
    <div>
      <h1>Event Handling Demo</h1>
      <p data-testid="message">Status: {message}</p>
      <p data-testid="click-count">Clicks: {clickCount}</p>

      <form
        data-testid="test-form"
        onSubmit={(event: SubmitEvent) => {
          event.preventDefault();
          message.value = "Form submission prevented!";
        }}
      >
        <input type="text" defaultValue="test input" />
        <button type="submit" data-testid="submit-btn">
          Submit Form
        </button>
      </form>

      <a
        href="https://example.com"
        data-testid="test-link"
        onClick={(event: MouseEvent) => {
          event.preventDefault();
          clickCount.value++;
          message.value = `Link click prevented! Count: ${clickCount.value}`;
        }}
      >
        Click this link
      </a>

      <button
        data-testid="reset-btn"
        onClick={(event: MouseEvent) => {
          event.preventDefault();
          message.value = "Reset clicked";
          clickCount.value = 0;
        }}
      >
        Reset
      </button>
    </div>
  );
}

test("event.preventDefault() works in onClick handlers", async () => {
  // Reset state
  serializer.reset();
  clear();

  // Generate HTML
  const html = renderHTML(<EventDemoComponent />);

  // Set DOM content directly
  document.body.innerHTML = html;

  // Load and execute the real client script
  const clientScript = fs.readFileSync(
    path.join(import.meta.dirname, "../public/fx-client.js"),
    "utf-8",
  );
  eval(clientScript);

  // Wait for hydration to complete
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Setup user event
  const user = userEvent.setup({ document });

  // Get elements
  const messageElement = getByTestId(document.body, "message");
  const clickCountElement = getByTestId(document.body, "click-count");
  const submitBtn = getByTestId(document.body, "submit-btn");
  const testLink = getByTestId(document.body, "test-link");
  const resetBtn = getByTestId(document.body, "reset-btn");

  // Verify initial state
  expect(messageElement.textContent).toBe("Status: Not submitted");
  expect(clickCountElement.textContent).toBe("Clicks: 0");

  // Test form submission prevention
  await user.click(submitBtn);
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(messageElement.textContent).toBe("Status: Form submission prevented!");

  // Test link click prevention and counting
  await user.click(testLink);
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(messageElement.textContent).toBe(
    "Status: Link click prevented! Count: 1",
  );
  expect(clickCountElement.textContent).toBe("Clicks: 1");

  // Test multiple link clicks
  await user.click(testLink);
  await user.click(testLink);
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(messageElement.textContent).toBe(
    "Status: Link click prevented! Count: 3",
  );
  expect(clickCountElement.textContent).toBe("Clicks: 3");

  // Test reset
  await user.click(resetBtn);
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(messageElement.textContent).toBe("Status: Reset clicked");
  expect(clickCountElement.textContent).toBe("Clicks: 0");
});

test("form onSubmit with preventDefault works", async () => {
  // Reset state
  serializer.reset();
  clear();

  function FormComponent() {
    const submitStatus = useSignal("Ready");

    return (
      <form
        data-testid="form"
        onSubmit={(event: SubmitEvent) => {
          event.preventDefault();
          submitStatus.value = "Submitted without page reload";
        }}
      >
        <p data-testid="status">Status: {submitStatus}</p>
        <input type="text" name="username" defaultValue="testuser" />
        <button type="submit" data-testid="submit">
          Submit
        </button>
      </form>
    );
  }

  // Generate HTML
  const html = renderHTML(<FormComponent />);
  document.body.innerHTML = html;

  // Load client script
  const clientScript = fs.readFileSync(
    path.join(import.meta.dirname, "../public/fx-client.js"),
    "utf-8",
  );
  eval(clientScript);

  await new Promise((resolve) => setTimeout(resolve, 100));

  const user = userEvent.setup({ document });

  const statusElement = getByTestId(document.body, "status");
  const submitButton = getByTestId(document.body, "submit");

  // Verify initial state
  expect(statusElement.textContent).toBe("Status: Ready");

  // Submit form
  await user.click(submitButton);
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Form should be prevented and status updated
  expect(statusElement.textContent).toBe(
    "Status: Submitted without page reload",
  );
});
