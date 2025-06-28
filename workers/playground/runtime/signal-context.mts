import { isSignal } from "./reactive-signal.ts";
import { createSignal } from "./reactive-signal.ts";

let signalMap = new Map<string, any>();
let signalByIdMap = new Map<string, any>();
let variableNameMap = new Map<any, string>();
let idCounter = 0;

// Context stack for nested component execution
interface ComponentContext {
  id: string;
  variableNames: string[];
  signalIndex: number;
  signals: Record<string, any>;
}

let contextStack: ComponentContext[] = [];
let contextIdCounter = 0;

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
  contextStack = [];
  contextIdCounter = 0;
}

export function pushComponentContext(variableNames: string[]): string {
  const contextId = `component_${contextIdCounter++}`;
  const context: ComponentContext = {
    id: contextId,
    variableNames,
    signalIndex: 0,
    signals: {},
  };
  contextStack.push(context);
  return contextId;
}

export function popComponentContext(): ComponentContext | null {
  return contextStack.pop() || null;
}

export function getCurrentComponentContext(): ComponentContext | null {
  return contextStack[contextStack.length - 1] || null;
}

export function getComponentContextById(id: string): ComponentContext | null {
  return contextStack.find((ctx) => ctx.id === id) || null;
}

export function getAllComponentContexts(): ComponentContext[] {
  return [...contextStack];
}

export function useSignal<T>(
  initialValue: T,
  name?: string,
): ReturnType<typeof createSignal<T>> {
  const signal = createSignal(initialValue);
  const currentContext = getCurrentComponentContext();

  let varName = name;
  if (!varName && currentContext) {
    varName =
      currentContext.variableNames[currentContext.signalIndex] ||
      `signal_${idCounter}`;

    const actualVarName =
      currentContext.variableNames[currentContext.signalIndex];

    if (actualVarName) {
      currentContext.signals[actualVarName] = signal;
    }

    currentContext.signalIndex++;
  }

  if (!varName) {
    varName = `signal_${idCounter++}`;
  }

  registerSignal(varName, signal);
  return signal;
}
