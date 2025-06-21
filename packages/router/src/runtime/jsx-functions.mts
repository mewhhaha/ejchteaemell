import { jsx as originalJsx, escapeHtml } from "./jsx-runtime.mts";
import { into, type Html } from "./node.mts";
import { isSignal, getSignalValue } from "../signals.mts";
import { serializeFunction, isSerializedFunction, type SerializableFunction } from "../function-serializer.mts";
import "./jsx-signals-types.mts";
export type { JSX } from "./jsx-signals-types.mts";

// Event handler attributes that should be serialized
const EVENT_HANDLERS = new Set([
  'onclick', 'onchange', 'oninput', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress',
  'onmousedown', 'onmouseup', 'onmouseover', 'onmouseout', 'onmousemove',
  'onfocus', 'onblur', 'onload', 'onerror', 'onresize', 'onscroll'
]);

export function jsx(
  tag: string | Function,
  { children, ...props }: { children?: unknown } & Record<string, any>,
): Html {
  if (typeof tag === "function") {
    return tag({ children, ...props });
  }

  // Process props to handle function serialization and signals
  const processedProps: Record<string, any> = {};
  let hasFunctions = false;
  let hasSignals = false;

  for (const [key, value] of Object.entries(props)) {
    const lowerKey = key.toLowerCase();
    
    // Handle event handlers
    if (EVENT_HANDLERS.has(lowerKey) && typeof value === 'function') {
      // Capture the current scope for the function
      const capturedScope = captureScopeFromFunction(value);
      const serialized = serializeFunction(value, capturedScope);
      processedProps[key] = `__callHandler('${serialized.id}', event)`;
      hasFunctions = true;
    }
    // Handle serialized functions
    else if (EVENT_HANDLERS.has(lowerKey) && isSerializedFunction(value)) {
      processedProps[key] = `__callHandler('${value.id}', event)`;
      hasFunctions = true;
    }
    // Handle signals
    else if (isSignal(value)) {
      processedProps[key] = getSignalValue(value);
      hasSignals = true;
    }
    // Handle regular props
    else {
      processedProps[key] = value;
    }
  }

  // Process children for signals
  const processedChildren = processChildrenForSignals(children);
  hasSignals = hasSignals || processedChildren.hasSignals;

  // If no special handling needed, use original jsx
  if (!hasFunctions && !hasSignals) {
    return originalJsx(tag, { children: processedChildren.children, ...processedProps });
  }

  // Generate HTML with function/signal support
  const generator = async function* (): AsyncGenerator<string> {
    yield `<${tag}`;
    
    // Add processed attributes
    for (const [key, value] of Object.entries(processedProps)) {
      if (key === "children") continue;
      const sanitized = sanitizeAttribute(value);
      if (sanitized !== undefined) {
        yield ` ${key}="${sanitized}"`;
      }
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

// Attempt to capture scope from function (basic implementation)
function captureScopeFromFunction(fn: Function): Record<string, any> {
  // This is a simplified version. In a real implementation, you might:
  // 1. Use a babel plugin to inject scope information
  // 2. Require explicit dependency declaration
  // 3. Use a more sophisticated analysis
  
  // For now, return empty scope - developers will need to be explicit
  return {};
}

// Enhanced version that requires explicit dependencies
export function jsxWithScope(
  tag: string | Function,
  props: Record<string, any>,
  scope: Record<string, any> = {}
): Html {
  if (typeof tag === "function") {
    return tag(props);
  }

  const { children, ...otherProps } = props;
  const processedProps: Record<string, any> = {};
  let hasFunctions = false;

  for (const [key, value] of Object.entries(otherProps)) {
    const lowerKey = key.toLowerCase();
    
    if (EVENT_HANDLERS.has(lowerKey) && typeof value === 'function') {
      const serialized = serializeFunction(value, scope);
      processedProps[key] = `__callHandler('${serialized.id}', event)`;
      hasFunctions = true;
    } else if (isSignal(value)) {
      processedProps[key] = getSignalValue(value);
    } else {
      processedProps[key] = value;
    }
  }

  return jsx(tag, { children, ...processedProps });
}

// Helper functions (reused from jsx-signals.mts)
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
} {
  if (isSignal(children)) {
    return {
      children: children(),
      hasSignals: true,
    };
  }

  if (Array.isArray(children)) {
    const processed = children.map(child => processChildrenForSignals(child));
    const hasSignals = processed.some(p => p.hasSignals);
    
    return {
      children: processed.map(p => p.children),
      hasSignals,
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

// Helper to manually specify dependencies
export function withDeps<T extends (...args: any[]) => any>(
  fn: T, 
  deps: Record<string, any>
): SerializableFunction {
  return serializeFunction(fn, deps);
}

// JSX factory function that allows dependency injection
export function h(
  tag: string | Function,
  props: Record<string, any> | null,
  ...children: any[]
): Html {
  const actualProps = props || {};
  if (children.length > 0) {
    actualProps.children = children.length === 1 ? children[0] : children;
  }
  return jsx(tag, actualProps);
}