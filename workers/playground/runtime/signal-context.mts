import { isSignal } from "../test/reactive-signal.ts";
import { useSignal as createSignal } from "../test/reactive-signal.ts";

class SignalContext {
  private signalMap = new Map<string, any>();
  private signalByIdMap = new Map<string, any>();
  private variableNameMap = new Map<any, string>();
  private idCounter = 0;

  registerSignal(varName: string, signal: any): void {
    if (isSignal(signal)) {
      this.signalMap.set(varName, signal);
      this.signalByIdMap.set(signal.id, signal);
      this.variableNameMap.set(signal, varName);
    }
  }

  getSignal(varName: string): any {
    return this.signalMap.get(varName);
  }

  getSignalById(id: string): any {
    return this.signalByIdMap.get(id);
  }

  getVariableName(signal: any): string | undefined {
    return this.variableNameMap.get(signal);
  }

  getAllSignals(): Record<string, any> {
    return Object.fromEntries(this.signalMap);
  }

  clear(): void {
    this.signalMap.clear();
    this.signalByIdMap.clear();
    this.variableNameMap.clear();
    this.idCounter = 0;
  }

  // Legacy method - keeps existing API working
  track<T>(varName: string, signal: T): T {
    if (isSignal(signal)) {
      this.registerSignal(varName, signal);
    }
    return signal;
  }

  // New method - creates and tracks signal with auto-generated ID
  useSignal<T>(
    initialValue: T,
    name?: string,
  ): ReturnType<typeof createSignal<T>> {
    const signal = createSignal(initialValue);
    const varName = name || `signal_${this.idCounter++}`;
    this.registerSignal(varName, signal);
    return signal;
  }
}

export const signalContext = new SignalContext();
