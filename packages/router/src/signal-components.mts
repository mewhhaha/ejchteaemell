import { jsx } from "./runtime/jsx-signals.mts";
import { signal, type Signal } from "./signals.mts";
import type { JSX } from "./runtime/jsx.mts";
import type { Html } from "./runtime/node.mts";

// Helper component for buttons that modify signals
export function SignalButton({
  children,
  signal: sig,
  action = "increment",
  value,
  ...props
}: {
  children: JSX.Element;
  signal: Signal<any>;
  action?: "increment" | "decrement" | "toggle" | "set";
  value?: any;
} & Record<string, any>): Html {
  return jsx("signal-button", {
    "data-signal-id": sig.id,
    "data-action": action,
    "data-value": value !== undefined ? JSON.stringify(value) : undefined,
    children,
    ...props,
  });
}

// Helper component for inputs connected to signals
export function SignalInput({
  signal: sig,
  type = "text",
  ...props
}: {
  signal: Signal<any>;
  type?: "text" | "number" | "boolean";
} & Record<string, any>): Html {
  if (type === "boolean") {
    return jsx("signal-input", {
      "data-signal-id": sig.id,
      "data-type": type,
      children: jsx("input", { type: "checkbox", checked: sig(), ...props }),
    });
  }

  return jsx("signal-input", {
    "data-signal-id": sig.id,
    "data-type": type,
    children: jsx("input", { 
      type: type === "number" ? "number" : "text", 
      value: sig(), 
      ...props 
    }),
  });
}

// Helper component for displaying signal values
export function SignalDisplay({
  signal: sig,
  transform,
  ...props
}: {
  signal: Signal<any>;
  transform?: (value: any) => string;
} & Record<string, any>): Html {
  const displayValue = transform ? transform(sig()) : sig().toString();
  
  return jsx("span", {
    "data-signal-id": sig.id,
    children: displayValue,
    ...props,
  });
}

// Counter component example
export function Counter({ initialValue = 0 }: { initialValue?: number }): Html {
  const count = signal(initialValue);

  return jsx("div", {
    style: "display: flex; gap: 10px; align-items: center; padding: 20px; border: 1px solid #ccc; border-radius: 8px;",
    children: [
      SignalButton({
        signal: count,
        action: "decrement",
        children: jsx("span", { children: "−" }),
        style: "padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;",
      }),
      SignalDisplay({
        signal: count,
        style: "font-size: 18px; font-weight: bold; min-width: 40px; text-align: center;",
      }),
      SignalButton({
        signal: count,
        action: "increment",
        children: jsx("span", { children: "+" }),
        style: "padding: 8px 12px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer;",
      }),
    ],
  });
}

// Toggle component example
export function Toggle({ 
  initialValue = false, 
  trueText = "On", 
  falseText = "Off" 
}: { 
  initialValue?: boolean; 
  trueText?: string; 
  falseText?: string; 
}): Html {
  const toggle = signal(initialValue);

  return jsx("div", {
    style: "display: flex; gap: 10px; align-items: center; padding: 20px; border: 1px solid #ccc; border-radius: 8px;",
    children: [
      jsx("span", { 
        children: "Status:", 
        style: "font-weight: bold;" 
      }),
      SignalDisplay({
        signal: toggle,
        transform: (value) => value ? trueText : falseText,
        style: `padding: 4px 8px; border-radius: 4px; ${toggle() ? 'background: #4caf50; color: white;' : 'background: #f44336; color: white;'}`,
      }),
      SignalButton({
        signal: toggle,
        action: "toggle",
        children: jsx("span", { children: "Toggle" }),
        style: "padding: 8px 16px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer;",
      }),
    ],
  });
}

// Text input component example
export function TextInput({ 
  label, 
  initialValue = "", 
  placeholder 
}: { 
  label?: string; 
  initialValue?: string; 
  placeholder?: string; 
}): Html {
  const text = signal(initialValue);

  return jsx("div", {
    style: "display: flex; flex-direction: column; gap: 8px; padding: 20px; border: 1px solid #ccc; border-radius: 8px;",
    children: [
      label && jsx("label", { 
        children: label, 
        style: "font-weight: bold;" 
      }),
      SignalInput({
        signal: text,
        type: "text",
        placeholder,
        style: "padding: 8px; border: 1px solid #ddd; border-radius: 4px;",
      }),
      jsx("div", {
        style: "margin-top: 8px; padding: 8px; background: #f5f5f5; border-radius: 4px;",
        children: [
          jsx("strong", { children: "Current value: " }),
          SignalDisplay({ signal: text }),
        ],
      }),
    ],
  });
}