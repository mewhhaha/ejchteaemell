// FX Client - Hydration and Reactivity
class FXClient {
  constructor() {
    this.signals = new Map();
    this.handlers = new Map();
    this.functions = new Map(); // hash -> function
    this.bindings = new Map();
  }

  parseComments() {
    // Parse comments from HTML source for better compatibility with JSDOM
    const htmlSource = document.documentElement.outerHTML;
    console.log("DEBUG: Parsing HTML source for comments");

    // Find all HTML comments
    const commentMatches = htmlSource.matchAll(/<!--\s*(.*?)\s*-->/g);

    for (const match of commentMatches) {
      const data = match[1].trim();
      console.log("DEBUG: Found comment:", data);

      if (data.startsWith("fx:state:")) {
        try {
          const colonIndex = data.indexOf(":", 9); // After "fx:state:"
          const id = data.substring(9, colonIndex);
          const jsonData = data.substring(colonIndex + 1);
          const state = JSON.parse(jsonData);
          this.restoreSignal(state);
        } catch (e) {
          console.error("Failed to parse state comment:", data, e);
        }
      }

      if (data.startsWith("fx:binding:")) {
        try {
          const colonIndex = data.indexOf(":", 11); // After "fx:binding:"
          const signalId = data.substring(11, colonIndex);
          const jsonData = data.substring(colonIndex + 1);
          const nodes = JSON.parse(jsonData);
          this.restoreBinding(signalId, nodes);
        } catch (e) {
          console.error("Failed to parse binding comment:", data, e);
        }
      }
    }
  }

  registerFunction(hash, fn) {
    console.log("DEBUG: Registering function:", hash);
    this.functions.set(hash, fn);
  }

  registerHandler(handlerId, fnHash) {
    console.log(
      "DEBUG: Registering handler:",
      handlerId,
      "with function hash:",
      fnHash,
    );
    const fn = this.functions.get(fnHash);
    if (fn) {
      this.handlers.set(handlerId, (event) => fn.call(this, event));
      console.log("DEBUG: Handler successfully registered:", handlerId);
    } else {
      console.error("DEBUG: Function not found for hash:", fnHash);
    }
  }

  restoreSignal(state) {
    const signal = {
      id: state.id,
      _value: state.value,
      _subscribers: new Set(),

      get value() {
        return this._value;
      },

      set value(newValue) {
        if (this._value !== newValue) {
          this._value = newValue;
          this._subscribers.forEach((callback) => callback());
        }
      },

      subscribe(callback) {
        this._subscribers.add(callback);
        return () => this._subscribers.delete(callback);
      },
    };

    this.signals.set(state.id, signal);
  }

  restoreBinding(signalId, nodeIds) {
    console.log(
      "DEBUG: Restoring binding for signal:",
      signalId,
      "to nodes:",
      nodeIds,
    );
    const signal = this.signals.get(signalId);
    if (!signal) {
      console.log("DEBUG: Signal not found for binding:", signalId);
      return;
    }

    // Subscribe to signal changes and update all bound nodes
    signal.subscribe(() => {
      console.log(
        "DEBUG: Signal changed:",
        signalId,
        "new value:",
        signal.value,
      );
      nodeIds.forEach((nodeId) => {
        const element = document.getElementById(nodeId);
        if (element) {
          console.log(
            "DEBUG: Updating element:",
            nodeId,
            "with value:",
            signal.value,
          );
          element.textContent = signal.value;
        } else {
          console.log("DEBUG: Element not found:", nodeId);
        }
      });
    });

    console.log(
      "DEBUG: Subscription set up, subscribers count:",
      signal._subscribers.size,
    );
    this.bindings.set(signalId, nodeIds);
  }

  getSignal(id) {
    console.log("DEBUG: Getting signal:", id);
    const signal = this.signals.get(id);
    console.log("DEBUG: Signal found:", signal);
    return signal;
  }

  invokeHandler(handlerId, event) {
    console.log("DEBUG: Invoking handler:", handlerId);
    const handler = this.handlers.get(handlerId);
    if (handler) {
      console.log("DEBUG: Handler found, executing");
      const result = handler(event);
      console.log("DEBUG: Handler executed, result:", result);
      return result;
    } else {
      console.log("DEBUG: Handler not found for:", handlerId);
    }
  }

  hydrate() {
    this.parseComments();

    // Set up event handlers for all elements with fx.invokeHandler attributes
    const allElements = document.querySelectorAll("*");
    allElements.forEach((element) => {
      // Check all attributes for fx.invokeHandler patterns
      Array.from(element.attributes).forEach((attr) => {
        if (
          attr.name.startsWith("on") &&
          attr.value.includes("fx.invokeHandler")
        ) {
          // Extract handler ID from attribute like onclick="fx.invokeHandler('fx_1', event)"
          const match = attr.value.match(/fx\.invokeHandler\('([^']+)'.*\)/);
          if (match) {
            const handlerId = match[1];
            const eventType = attr.name.substring(2); // Remove "on" prefix

            // Set up the event listener with addEventListener for better compatibility
            element.addEventListener(eventType, (event) => {
              this.invokeHandler(handlerId, event);
            });
            // Remove the attribute to avoid conflicts
            element.removeAttribute(attr.name);
          }
        }
      });
    });
  }
}

// Global fx instance
window.fx = new FXClient();

// Auto-hydrate when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.fx.hydrate();
  });
} else {
  // DOM is already ready
  window.fx.hydrate();
}
