import { isSignal } from "../test/reactive-signal.ts";

class SignalContext {
  private signalMap = new Map<string, any>();

  registerSignal(varName: string, signal: any): void {
    if (isSignal(signal)) {
      this.signalMap.set(varName, signal);
    }
  }

  getSignal(varName: string): any {
    return this.signalMap.get(varName);
  }

  getAllSignals(): Record<string, any> {
    return Object.fromEntries(this.signalMap);
  }

  clear(): void {
    this.signalMap.clear();
  }

  // This function wraps signals to track their variable names
  track<T>(varName: string, signal: T): T {
    if (isSignal(signal)) {
      this.registerSignal(varName, signal);
    }
    return signal;
  }
}

export const signalContext = new SignalContext();
