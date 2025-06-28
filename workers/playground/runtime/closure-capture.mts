import { isSignal } from "./reactive-signal.ts";
import { getSignal } from "./signal-context.mts";

interface CapturedVariable {
  name: string;
  signalId: string;
  type: "signal";
}

class ClosureCapture {
  private scopeStack: Map<string, any>[] = [];

  pushScope(scope: Record<string, any>): void {
    this.scopeStack.push(new Map(Object.entries(scope)));
  }

  popScope(): void {
    this.scopeStack.pop();
  }

  findVariable(name: string): any {
    // First check the signal context
    const signal = getSignal(name);
    if (signal) return signal;

    // Then check scope stack
    for (let i = this.scopeStack.length - 1; i >= 0; i--) {
      const scope = this.scopeStack[i];
      if (scope.has(name)) {
        return scope.get(name);
      }
    }
    return undefined;
  }

  extractVariablesFromFunction(fnString: string): string[] {
    const variables = new Set<string>();

    // More comprehensive regex patterns for variable detection
    const patterns = [
      // Variable followed by .property or [
      /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\.\s*\w+/g,
      /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\[\s*['"`]/g,
      // Assignment to variable.property
      /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\.\s*\w+\s*[=]/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(fnString)) !== null) {
        const varName = match[1];
        // Skip common globals and keywords
        if (
          ![
            "window",
            "document",
            "console",
            "this",
            "event",
            "return",
            "function",
            "const",
            "let",
            "var",
          ].includes(varName)
        ) {
          variables.add(varName);
        }
      }
    }

    return Array.from(variables);
  }

  captureClosureVariables(fn: Function): CapturedVariable[] {
    const fnString = fn.toString();
    const captured: CapturedVariable[] = [];

    // Extract variable names used in the function
    const variableNames = this.extractVariablesFromFunction(fnString);

    // For each variable name, check if we have a signal for it
    for (const varName of variableNames) {
      const signal = this.findVariable(varName);
      if (isSignal(signal)) {
        const signalId = signal.serialize();
        captured.push({
          name: varName,
          signalId,
          type: "signal",
        });
      }
    }
    return captured;
  }

  injectClosureVariables(
    fnString: string,
    captured: CapturedVariable[],
  ): string {
    if (captured.length === 0) return fnString;

    // Build variable declarations
    const declarations = captured
      .map((cv) => `const ${cv.name} = fx.getSignal('${cv.signalId}');`)
      .join("\n  ");

    // Handle different function formats
    // 1. Arrow function with braces: () => { ... }
    if (fnString.includes("=>") && fnString.includes("{")) {
      return fnString.replace(/(\([^)]*\)\s*=>\s*{)/, (match) => {
        return match + "\n  " + declarations;
      });
    }

    // 2. Arrow function without braces: () => expression
    if (fnString.includes("=>") && !fnString.includes("{")) {
      const arrowIndex = fnString.indexOf("=>");
      const params = fnString.substring(0, arrowIndex + 2).trim();
      const body = fnString.substring(arrowIndex + 2).trim();
      return `${params} {\n  ${declarations}\n  return ${body};\n}`;
    }

    // 3. Regular function: function() { ... }
    return fnString.replace(/^(function\s*\([^)]*\)\s*{)/, (match) => {
      return match + "\n  " + declarations;
    });
  }

  processFunction(fn: Function): string {
    const fnString = fn.toString();

    // New approach: inject ALL signals from scope and rewrite signal accesses
    let processedFunction = fnString;
    const availableSignals: Record<string, string> = {};

    // Collect all signals from all scopes
    for (let i = this.scopeStack.length - 1; i >= 0; i--) {
      const scope = this.scopeStack[i];
      for (const [name, value] of scope) {
        if (isSignal(value)) {
          const signalId = value.serialize();
          availableSignals[signalId] = name;

          // Replace variable.value with fx.getSignal('signalId').value
          const regex = new RegExp(`\\b${name}\\.value\\b`, "g");
          processedFunction = processedFunction.replace(
            regex,
            `fx.getSignal('${signalId}').value`,
          );

          // Replace variable assignments: variable.value = x
          const assignRegex = new RegExp(`\\b${name}\\.value\\s*=`, "g");
          processedFunction = processedFunction.replace(
            assignRegex,
            `fx.getSignal('${signalId}').value =`,
          );
        }
      }
    }

    return processedFunction;
  }
}

export const closureCapture = new ClosureCapture();
