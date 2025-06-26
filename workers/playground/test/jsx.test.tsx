import { test, expect } from "vitest";
import { type JSX } from "../runtime/jsx-runtime.mts";
import { userEvent } from "@testing-library/user-event";
import { screen } from "@testing-library/dom";
import { useSignal } from "./signal.ts";
import { beforeEach } from "node:test";

const render = async (element: JSX.Element) => {
  const e = await (element instanceof Promise
    ? await element
    : element
  ).toPromise();
  document.body.innerHTML = e;
  return e;
};

beforeEach(() => {
  document.body.innerHTML = "";
});

test("renders jsx", async () => {
  function App() {
    return <div>Hello World</div>;
  }

  await render(<App />);
  screen.getByText("Hello World");
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

  await render(<Component />);

  const user = userEvent.setup();

  await user.click(screen.getByRole("button"));
  expect(screen.getByRole("status")).toHaveTextContent("1");
});
