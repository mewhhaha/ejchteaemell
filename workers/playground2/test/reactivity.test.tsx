import { type JSX } from "playground/jsx-runtime";
import { describe, it } from "vitest";
import { screen } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import { effect, handler, useSignal, type Signal } from "./helpers.js";

const render = async (e: JSX.Element) => {
  const html = e instanceof Promise ? await e : e;
  const element = await html.toPromise();
  document.body.innerHTML = element;
};

describe("render simple html", () => {
  it("should render simple button", async () => {
    await render(<button>Hello</button>);

    screen.getByRole("button", { name: "Hello" });
  });
});

describe("render interactive html", () => {
  it("should render simple button", async () => {
    const Component = () => {
      return (
        <button
          onClick={`(${() => {
            const button = document.body.querySelector("button");
            if (button) {
              button.textContent = "Clicked";
            }
          }})()`}
        >
          Hello
        </button>
      );
    };
    await render(<Component />);

    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: "Hello" });
    await user.click(button);
    screen.getByRole("button", { name: "Clicked" });
  });

  it("should increment textContent when button is clicked", async () => {
    function Component(this: { signal: Signal<number> }) {
      this.signal = useSignal(0);

      return (
        <button
          onClick={handler(() => {
            this.signal.value++;
          })}
        >
          {effect(() => `${this.signal.value}`)}
        </button>
      );
    }
    await render(<Component />);

    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: "0" });
    await user.click(button);
    screen.getByRole("button", { name: "1" });
    await user.click(button);
    screen.getByRole("button", { name: "2" });
  });

  it("should work with async components", async () => {
    async function AsyncComponent(this: { signal: Signal<number> }) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.signal = useSignal(10);
      return (
        <button
          onClick={handler(() => {
            this.signal.value++;
          })}
        >
          {effect(() => `${this.signal.value}`)}
        </button>
      );
    }

    function Component(this: { signal: Signal<number> }) {
      this.signal = useSignal(0);

      return (
        <>
          <AsyncComponent />
          <button
            onClick={handler(() => {
              this.signal.value++;
            })}
          >
            {effect(() => `${this.signal.value}`)}
          </button>
        </>
      );
    }
    await render(<Component />);

    const user = userEvent.setup();
    const syncButton = screen.getByRole("button", { name: "0" });
    const asyncButton = screen.getByRole("button", { name: "10" });
    await user.click(syncButton);
    await user.click(asyncButton);
    screen.getByRole("button", { name: "1" });
    screen.getByRole("button", { name: "10" });
    await user.click(syncButton);
    await user.click(asyncButton);
    screen.getByRole("button", { name: "2" });
    screen.getByRole("button", { name: "11" });
  });
});

describe("import outside dependencies", () => {
  it.skip("should handle dynamic imports", async () => {
    const Component = () => {
      return (
        <button
          onClick={handler(async () => {
            const { nanoid } = await import("nanoid");
            const button = document.body.querySelector("button");
            if (button) {
              button.textContent = nanoid();
            }
          })}
        >
          Hello
        </button>
      );
    };
    await render(<Component />);

    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: "Hello" });
    await user.click(button);
    screen.getByRole("button", { name: /[a-z0-9]{10}/ });
  });
});
