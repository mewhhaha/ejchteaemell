interface SerializedState {
  id: string;
  type: "signal" | "computed" | "effect";
  value: any;
}

interface SerializedHandler {
  id: string;
  event: string;
  fn: string;
  thisBinding?: string;
}

class Serializer {
  private stateMap = new Map<string, SerializedState>();
  private handlerMap = new Map<string, SerializedHandler>();
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
    const serialized: SerializedHandler = {
      id,
      event,
      fn,
    };
    this.handlerMap.set(id, serialized);
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

    const serialized: SerializedHandler = {
      id,
      event,
      fn: fnString,
    };
    this.handlerMap.set(id, serialized);
    return id;
  }

  generateStateComments(): string {
    let comments = "";
    for (const [id, state] of this.stateMap) {
      comments += `<!-- fx:state:${id}:${JSON.stringify(state)} -->\n`;
    }
    return comments;
  }

  generateHandlerComments(): string {
    let comments = "";
    for (const [id, handler] of this.handlerMap) {
      comments += `<!-- fx:handler:${id}:${JSON.stringify(handler)} -->\n`;
    }
    return comments;
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
      this.generateHandlerComments() +
      this.generateBindingComments()
    );
  }

  reset(): void {
    this.stateMap.clear();
    this.handlerMap.clear();
    this.signalBindings.clear();
    this.idCounter = 0;
    this.hasInjectedScript = false;
  }
}

export const serializer = new Serializer();
