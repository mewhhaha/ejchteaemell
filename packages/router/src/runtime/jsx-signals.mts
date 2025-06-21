import { jsx as originalJsx, escapeHtml } from "./jsx-runtime.mts";
import { into, type Html } from "./node.mts";
import { isSignal, signalRef, type Signal, type SignalValue } from "../signals.mts";
import "./jsx-signals-types.mts";
export type { JSX } from "./jsx-signals-types.mts";

const signalElements = new Set<string>();

export function jsx(
  tag: string | Function,
  { children, ...props }: { children?: unknown } & Record<string, any>,
): Html {
  if (typeof tag === "function") {
    return tag({ children, ...props });
  }

  // Check if any props contain signals
  const signalProps: Record<string, SignalValue<any>> = {};
  const staticProps: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(props)) {
    if (isSignal(value)) {
      signalProps[key] = signalRef(value);
      staticProps[key] = value(); // Use current value for SSR
    } else {
      staticProps[key] = value;
    }
  }

  // Process children for signals
  const processedChildren = processChildrenForSignals(children);

  // If no signals, use original jsx
  if (Object.keys(signalProps).length === 0 && !processedChildren.hasSignals) {
    return originalJsx(tag, { children: processedChildren.children, ...staticProps });
  }

  // Create reactive element
  const elementId = `signal-element-${crypto.randomUUID()}`;
  signalElements.add(elementId);

  const generator = async function* (): AsyncGenerator<string> {
    yield `<${tag} data-signal-id="${elementId}"`;
    
    // Add static attributes
    for (const [key, value] of Object.entries(staticProps)) {
      if (key === "children") continue;
      const sanitized = sanitizeAttribute(value);
      if (sanitized !== undefined) {
        yield ` ${key}="${sanitized}"`;
      }
    }

    // Add signal data
    if (Object.keys(signalProps).length > 0 || processedChildren.hasSignals) {
      const signalData = {
        props: signalProps,
        children: processedChildren.signalChildren,
      };
      yield ` data-signals='${escapeHtml(JSON.stringify(signalData))}'`;
    }

    yield `>`;

    // Render children
    if (processedChildren.children !== undefined) {
      yield* renderChild(processedChildren.children);
    }

    yield `</${tag}>`;
  };

  return into(generator());
}

async function* renderChild(child: unknown): AsyncGenerator<string> {
  if (child === undefined || child === null || child === false) {
    return;
  }
  if (child instanceof Promise) {
    const resolved = await child;
    yield* renderChild(resolved);
    return;
  }
  if (typeof child === "object" && "text" in child) {
    yield* (child as Html).text;
    return;
  }
  if (Array.isArray(child)) {
    for (const c of child) {
      yield* renderChild(c);
    }
    return;
  }
  if (typeof child === "function") {
    yield* renderChild(child());
    return;
  }
  yield escapeHtml(child.toString());
}

function processChildrenForSignals(children: unknown): {
  children: unknown;
  hasSignals: boolean;
  signalChildren?: Array<{ type: "signal"; id: string; value: any }>;
} {
  if (isSignal(children)) {
    return {
      children: children(),
      hasSignals: true,
      signalChildren: [{ type: "signal", id: children.id, value: children() }],
    };
  }

  if (Array.isArray(children)) {
    const processed = children.map(child => processChildrenForSignals(child));
    const hasSignals = processed.some(p => p.hasSignals);
    const signalChildren = processed.flatMap(p => p.signalChildren || []);
    
    return {
      children: processed.map(p => p.children),
      hasSignals,
      signalChildren: hasSignals ? signalChildren : undefined,
    };
  }

  return { children, hasSignals: false };
}

function sanitizeAttribute(value: any): string | undefined {
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
  return undefined;
}

export function jsxs(tag: any, props: any): Html {
  return jsx(tag, props);
}

// Get all signal elements for hydration
export function getSignalElements(): string[] {
  return Array.from(signalElements);
}