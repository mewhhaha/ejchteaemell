import { jsx } from "./runtime/jsx-runtime.mts";
import type { Signal } from "./signals.mts";
import type { Html } from "./runtime/node.mts";

export type SignalAction = 
  | { type: "set"; signalId: string; value: any }
  | { type: "update"; signalId: string; updater: "increment" | "decrement" | "toggle" };

export function signalButton(
  props: {
    signal: Signal<any>;
    action: "increment" | "decrement" | "toggle" | { type: "set"; value: any };
    event?: string;
    children?: any;
  } & Record<string, any>
): Html {
  const { signal, action, event = "click", children, ...rest } = props;
  
  const signalAction: SignalAction = typeof action === "string" 
    ? { type: "update", signalId: signal.id, updater: action }
    : { type: "set", signalId: signal.id, value: action.value };
  
  const actionAttr = JSON.stringify({
    ...signalAction,
    event
  });
  
  return jsx("button", {
    ...rest,
    "data-signal-action": actionAttr,
    children
  });
}

export function incrementButton(signal: Signal<number>, props: any = {}): Html {
  return signalButton({
    signal,
    action: "increment",
    children: props.children || "+",
    ...props
  });
}

export function decrementButton(signal: Signal<number>, props: any = {}): Html {
  return signalButton({
    signal,
    action: "decrement", 
    children: props.children || "-",
    ...props
  });
}

export function toggleButton(signal: Signal<boolean>, props: any = {}): Html {
  return signalButton({
    signal,
    action: "toggle",
    children: props.children || "Toggle",
    ...props
  });
}

export function setButton<T>(signal: Signal<T>, value: T, props: any = {}): Html {
  return signalButton({
    signal,
    action: { type: "set", value },
    children: props.children || "Set",
    ...props
  });
}