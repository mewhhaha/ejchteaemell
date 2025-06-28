import { into, isHtml, type Html } from "./node.mts";
import "./typed.mts";
import type { Annotation, JSX } from "./typed.mts";
export type * from "./typed.mts";
export { type JSX } from "./jsx.mts";
export { into };

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

export const annotate = <T extends unknown>(
  value: T,
  annotation: string | Promise<string>,
): Annotation<T> => {
  return {
    __isAnnotation: true,
    value,
    annotation,
  };
};

const isAnnotation = (value: unknown): value is Annotation<unknown> => {
  return (
    value !== undefined &&
    typeof value === "object" &&
    value !== null &&
    "__isAnnotation" in value
  );
};

export const scopes: unknown[] = [];

export function jsx(
  tag: string | Function,
  { children, ...props }: { children?: unknown } & Record<string, any>,
): Html {
  if (typeof tag === "function") {
    const context = {};
    scopes.push(context);
    const result = tag.bind(context)({ children, ...props });
    scopes.pop();

    return result;
  }

  let comments: [string, Promise<string>][] = [];

  let attrs = "";
  for (const key in props) {
    let value = props[key];

    if (isAnnotation(value)) {
      comments.push([key, Promise.resolve(value.annotation)]);
      value = value.value;
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

  const generator = async function* (): AsyncGenerator<string> {
    if (tag) {
      yield `<${tag}${attrs}>`;
    }

    async function* processChild(child: unknown): AsyncGenerator<string> {
      if (child === undefined || child === null || child === false) {
        return;
      }
      if (isAnnotation(child)) {
        yield* processChild(child.value);
        return;
      }
      if (child instanceof Promise) {
        const resolved = await child;
        yield* processChild(resolved);
        return;
      }
      if (isHtml(child)) {
        yield* child.generator;
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

  if (comments.length > 0) {
    async function* combined(): AsyncGenerator<string> {
      const content = [];
      for (const [key, value] of comments) {
        const resolved = await value;
        content.push(
          `${key.toLocaleLowerCase()}="${encodeURIComponent(resolved)}"`,
        );
      }
      yield* `<!-- ${content
        .join("; ")
        .replaceAll(/(--)|(-->)|(<!--)/g, "")} -->`;
      yield* generator();
    }

    return into(combined());
  }

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
