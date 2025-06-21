import { into, isHtml, type Html } from "./node.mts";
import "./typed.mts";
import type { JSX } from "./typed.mts";
import { isSignal, type Signal } from "../signals.mts";
export type * from "./typed.mts";
export { type JSX } from "./jsx.mts";

export const Fragment = (props: any): any => jsx("", props);

// Void elements are self-closing and shouldn't have a closing tag
const voidElements = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

export function jsx(
  tag: string | Function,
  { children, ...props }: { children?: unknown } & Record<string, any>,
): Html {
  if (typeof tag === "function") {
    return tag({ children, ...props });
  }

  let attrs = "";
  const signalBindings: Array<{ key: string; signal: Signal<any> }> = [];
  
  for (const key in props) {
    let value = props[key];

    if (isSignal(value)) {
      signalBindings.push({ key, signal: value });
      value = value.get();
    }

    let sanitized = sanitize(value);
    if (sanitized === undefined) {
      continue;
    }

    // Special case for class to make the class names more readable

    if (key === "class") {
      sanitized = sanitized
        ?.split(/\s+/g)
        .filter((x: string) => x !== "")
        .join(" ");
    }

    attrs += ` ${key}="${sanitized}" `;
  }
  
  // Add signal binding attributes
  if (signalBindings.length > 0) {
    for (const { key, signal } of signalBindings) {
      attrs += ` data-signal-id="${signal.id}"`;
      attrs += ` data-signal-type="attr"`;
      attrs += ` data-signal-property="${key}"`;
      attrs += ` data-signal-value="${escapeHtml(JSON.stringify(signal.get()))}"`;
    }
  }

  const generator = async function* (): AsyncGenerator<string> {
    if (tag) {
      yield `<${tag}${attrs}>`;
    }

    async function* processChild(child: unknown): AsyncGenerator<string> {
      if (child === undefined || child === null || child === false) {
        return;
      }
      if (child instanceof Promise) {
        const resolved = await child;
        yield* processChild(resolved);
        return;
      }
      if (isSignal(child)) {
        const signal = child as Signal<any>;
        yield `<span data-signal-id="${signal.id}" data-signal-type="text" data-signal-value="${escapeHtml(JSON.stringify(signal.get()))}">${escapeHtml(signal.get().toString())}</span>`;
        return;
      }
      if (isHtml(child)) {
        yield* child.text;
        return;
      }
      if (Array.isArray(child)) {
        for (let i = 0; i < child.length; i++) {
          const c = child[i];
          yield* processChild(c);
        }
        return;
      }

      if (typeof child === "function") {
        yield* processChild(child());
        return;
      }

      yield escapeHtml(child.toString());
    }

    yield* processChild(children);

    if (tag && !voidElements.has(tag)) {
      yield `</${tag}>`;
    }
  };

  return into(generator());
}

export function escapeHtml(input: string): string {
  return input.replaceAll(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

const sanitize = (value: any) => {
  if (typeof value === "string") {
    return value.replaceAll(/"/g, "&quot;");
  }
  if (value === null || value === undefined || value === false) {
    return undefined;
  }

  if (value === true) {
    return "true";
  }

  if (typeof value === "number") {
    return value.toString();
  }
};

export function jsxs(tag: any, props: any): JSX.Element {
  return jsx(tag, props);
}
