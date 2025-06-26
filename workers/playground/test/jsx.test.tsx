import { test, expect } from "vitest";
import { type JSX } from "../runtime/jsx-runtime.mts";
import { userEvent } from "@testing-library/user-event";
import { getByRole } from "@testing-library/dom";
import { useSignal } from "./signal.ts";

const render = async (element: JSX.Element) => {
  return await (element instanceof Promise
    ? await element
    : element
  ).toPromise();
};

test("renders jsx", async () => {
  function App() {
    return <div>Hello World</div>;
  }

  const element = await render(<App />);
  expect(element).toBe("<div>Hello World</div>");
});

test("render button with onclick", async () => {
  function Component() {
    const signal = useSignal(0);
    return (
      <div>
        <button
          onClick={() => {
            signal.value = signal.value + 1;
          }}
        >
          Click me
        </button>
        <output>{signal.value}</output>
      </div>
    );
  }
  const element = await render(<Component />);

  const user = userEvent.setup();

  await user.click(getByRole(element, "button"));
});
