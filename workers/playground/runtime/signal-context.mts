import { isSignal } from "./reactive-signal.ts";
import { createSignal } from "./reactive-signal.ts";

let signalMap = new Map<string, any>();
let signalByIdMap = new Map<string, any>();
let variableNameMap = new Map<any, string>();
let idCounter = 0;

export function registerSignal(varName: string, signal: any): void {
  if (isSignal(signal)) {
    signalMap.set(varName, signal);
    signalByIdMap.set(signal.id, signal);
    variableNameMap.set(signal, varName);
  }
}

export function getSignal(varName: string): any {
  return signalMap.get(varName);
}

export function getSignalById(id: string): any {
  return signalByIdMap.get(id);
}

export function getVariableName(signal: any): string | undefined {
  return variableNameMap.get(signal);
}

export function getAllSignals(): Record<string, any> {
  return Object.fromEntries(signalMap);
}

export function clear(): void {
  signalMap.clear();
  signalByIdMap.clear();
  variableNameMap.clear();
  idCounter = 0;
}

export function useSignal<T>(
  initialValue: T,
  name?: string,
): ReturnType<typeof createSignal<T>> {
  const signal = createSignal(initialValue);
  const varName = name || `signal_${idCounter++}`;
  registerSignal(varName, signal);
  return signal;
}
