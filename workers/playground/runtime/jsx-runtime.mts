import { serializer } from "./serializer.mts";
import { isSignal, createSignal } from "./reactive-signal.ts";
import { closureCapture } from "./closure-capture.mts";
import {
  pushComponentContext,
  popComponentContext,
  getCurrentComponentContext,
  getAllComponentContexts,
} from "./signal-context.mts";

export function jsx(type: any, props: any): any {
  if (typeof type === "function") {
    const fnSource = type.toString();

    const variableNames: string[] = [];
    const matches = fnSource.matchAll(
      /(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\.)?\buseSignal\)\s*\(/g,
    );
    for (const match of matches) {
      variableNames.push(match[1]);
    }

    const contextId = pushComponentContext(variableNames);

    const result = type(props);

    const context = popComponentContext();

    if (context && Object.keys(context.signals).length > 0) {
      setJSXScope(context.signals);
      serializer.processHandlersWithClosure(closureCapture);
      setTimeout(() => clearJSXScope(), 0);
    }

    return result;
  }

  let newProps = { ...props };

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === "function" && key.startsWith("on")) {
        const handlerId = serializer.addHandler(
          key.slice(2).toLowerCase(),
          value.toString(),
        );
        newProps[key] = `fx.invokeHandler('${handlerId}', event)`;
      }
    }
  }

  if (type === "html" && !serializer.hasInjectedScript) {
    serializer.hasInjectedScript = true;
    newProps.children = [
      ...(Array.isArray(newProps.children)
        ? newProps.children
        : [newProps.children].filter(Boolean)),
      jsx("script", { src: "/fx-client.js" }),
    ];
  }

  const element = {
    type,
    props: newProps,
    key: props?.key,
  };

  return element;
}

export const jsxs = jsx;
export const Fragment = (props: any): any => jsx("", props);

let currentJSXScope: Record<string, any> = {};

export function setJSXScope(scope: Record<string, any>): void {
  currentJSXScope = scope;
  closureCapture.pushScope(scope);
}

export function clearJSXScope(): void {
  currentJSXScope = {};
  closureCapture.popScope();
}

export function getJSXScope(): Record<string, any> {
  return currentJSXScope;
}

export function renderToString(element: any): string {
  if (element === null || element === undefined) {
    return "";
  }

  if (typeof element === "string" || typeof element === "number") {
    return String(element);
  }

  if (isSignal(element)) {
    const signalId = element.serialize();
    const boundNodeId = serializer.addSignalBinding(signalId);
    return `<span id="${boundNodeId}">${element.value}</span>`;
  }

  if (Array.isArray(element)) {
    return element.map(renderToString).join("");
  }

  if (typeof element === "object" && element.type) {
    const { type, props } = element;

    if (typeof type === "function") {
      // This path shouldn't be hit now since components are processed in jsx()
      return renderToString(type(props));
    }

    const attributeString = props
      ? Object.entries(props)
          .filter(([key]) => key !== "children")
          .map(([key, value]) => {
            if (key === "className") {
              return `class="${value}"`;
            }
            if (
              typeof value === "string" &&
              value.startsWith("fx.invokeHandler")
            ) {
              // Convert React-style event names to HTML attributes
              const eventName = key.toLowerCase().replace(/^on/, "");
              return `on${eventName}="${value}"`;
            }
            return `${key}="${value}"`;
          })
          .join(" ")
      : "";

    const childrenString = props?.children
      ? Array.isArray(props.children)
        ? props.children.map(renderToString).join("")
        : renderToString(props.children)
      : "";

    if (
      [
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
      ].includes(type)
    ) {
      return `<${type}${attributeString ? " " + attributeString : ""} />`;
    }

    return `<${type}${
      attributeString ? " " + attributeString : ""
    }>${childrenString}</${type}>`;
  }

  return String(element);
}

export function renderHTML(element: any): string {
  const html = renderToString(element);
  const state = serializer.serialize();
  return html + "\n" + state;
}
