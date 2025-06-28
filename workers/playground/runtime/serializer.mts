interface SerializedState {
  id: string;
  type: "signal" | "computed" | "effect";
  value: any;
}

interface SerializedHandler {
  id: string;
  event: string;
  fn: string;
  fnHash: string;
  thisBinding?: string;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

class Serializer {
  private stateMap = new Map<string, SerializedState>();
  private handlerMap = new Map<string, SerializedHandler>();
  private functionHashes = new Map<string, string>(); // hash -> function string
  private signalBindings = new Map<string, string[]>(); // signal id -> dom node ids
  private idCounter = 0;
  public hasInjectedScript = false;

  generateId(): string {
    return `fx_${this.idCounter++}`;
  }

  serializeState(state: any): string {
    const id = this.generateId();
    const serialized: SerializedState = {
      id,
      type: "signal",
      value: state.value,
    };
    this.stateMap.set(id, serialized);
    return id;
  }

  addHandler(event: string, fn: string): string {
    const id = this.generateId();
    const fnHash = simpleHash(fn);

    const serialized: SerializedHandler = {
      id,
      event,
      fn,
      fnHash,
    };
    this.handlerMap.set(id, serialized);

    // Store the function by hash for deduplication
    this.functionHashes.set(fnHash, fn);

    return id;
  }

  serializeHandler(
    fn: Function,
    event: string,
    closureVars?: Record<string, any>,
  ): string {
    const id = this.generateId();

    let fnString = fn.toString();

    if (closureVars) {
      const varDeclarations = Object.entries(closureVars)
        .map(([key, value]) => `const ${key} = ${JSON.stringify(value)};`)
        .join("\n");
      fnString = `function() {\n${varDeclarations}\n${fnString
        .replace(/^function[^{]*{/, "")
        .replace(/}$/, "")}\n}`;
    }

    const fnHash = simpleHash(fnString);

    const serialized: SerializedHandler = {
      id,
      event,
      fn: fnString,
      fnHash,
    };
    this.handlerMap.set(id, serialized);

    // Store the function by hash for deduplication
    this.functionHashes.set(fnHash, fnString);

    return id;
  }

  generateStateComments(): string {
    let comments = "";
    for (const [id, state] of this.stateMap) {
      comments += `<!-- fx:state:${id}:${JSON.stringify(state)} -->\n`;
    }
    return comments;
  }

  generateHandlerScripts(): string {
    let scripts = "";

    // First, emit unique function definitions by hash
    const emittedHashes = new Set<string>();
    for (const [hash, fnString] of this.functionHashes) {
      if (!emittedHashes.has(hash)) {
        scripts += `<script>fx.registerFunction('${hash}', ${fnString});</script>\n`;
        emittedHashes.add(hash);
      }
    }

    // Then, register handlers that reference the functions by hash
    for (const [id, handler] of this.handlerMap) {
      scripts += `<script>fx.registerHandler('${id}', '${handler.fnHash}');</script>\n`;
    }

    return scripts;
  }

  addSignalBinding(signalId: string, nodeId?: string): string {
    const domNodeId = nodeId || this.generateId();

    if (!this.signalBindings.has(signalId)) {
      this.signalBindings.set(signalId, []);
    }
    this.signalBindings.get(signalId)!.push(domNodeId);

    return domNodeId;
  }

  generateBindingComments(): string {
    let comments = "";
    for (const [signalId, nodeIds] of this.signalBindings) {
      comments += `<!-- fx:binding:${signalId}:${JSON.stringify(
        nodeIds,
      )} -->\n`;
    }
    return comments;
  }

  serialize(): string {
    return (
      this.generateStateComments() +
      this.generateHandlerScripts() +
      this.generateBindingComments()
    );
  }

  processHandlersWithClosure(closureCapture: any): void {
    // Process all raw handlers with closure capture
    for (const [id, handler] of this.handlerMap) {
      if (handler.fn && !handler.fn.includes("fx.getSignal")) {
        // Create a function from the string to process it
        try {
          const fn = new Function(`return ${handler.fn}`)();
          const processedFn = closureCapture.processFunction(fn);

          // Update handler with processed function and new hash
          handler.fn = processedFn;
          handler.fnHash = simpleHash(processedFn);

          // Update the function hash map
          this.functionHashes.set(handler.fnHash, processedFn);
        } catch (e) {
          // If we can't parse the function, leave it as is
          console.warn("Failed to process handler function:", e);
        }
      }
    }
  }

  reset(): void {
    this.stateMap.clear();
    this.handlerMap.clear();
    this.functionHashes.clear();
    this.signalBindings.clear();
    this.idCounter = 0;
    this.hasInjectedScript = false;
  }
}

export const serializer = new Serializer();
