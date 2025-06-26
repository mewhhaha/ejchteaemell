// FX Client - Hydration and Reactivity
class FXClient {
  constructor() {
    this.signals = new Map();
    this.handlers = new Map();
    this.bindings = new Map();
  }

  parseComments() {
    const walker = document.createTreeWalker(
      document.documentElement,
      NodeFilter.SHOW_COMMENT,
      null,
      false,
    );

    let comment;
    while ((comment = walker.nextNode())) {
      const data = comment.data.trim();

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

      if (data.startsWith("fx:handler:")) {
        try {
          const colonIndex = data.indexOf(":", 11); // After "fx:handler:"
          const id = data.substring(11, colonIndex);
          const jsonData = data.substring(colonIndex + 1);
          const handler = JSON.parse(jsonData);
          this.restoreHandler(handler);
        } catch (e) {
          console.error("Failed to parse handler comment:", data, e);
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

  restoreHandler(handler) {
    // Create function from string
    const fn = new Function(
      "fx",
      "event",
      `
      return (${handler.fn})()`,
    );

    this.handlers.set(handler.id, fn);
  }

  restoreBinding(signalId, nodeIds) {
    const signal = this.signals.get(signalId);
    if (!signal) return;

    // Subscribe to signal changes and update all bound nodes
    signal.subscribe(() => {
      nodeIds.forEach((nodeId) => {
        const element = document.getElementById(nodeId);
        if (element) {
          element.textContent = signal.value;
        }
      });
    });

    this.bindings.set(signalId, nodeIds);
  }

  getSignal(id) {
    return this.signals.get(id);
  }

  invokeHandler(handlerId, event) {
    const handler = this.handlers.get(handlerId);
    if (handler) {
      return handler(this, event);
    }
  }

  hydrate() {
    this.parseComments();

    // Set up click handlers by finding elements with fx.invokeHandler onclick attributes
    const elementsWithHandlers = document.querySelectorAll(
      '[onclick*="fx.invokeHandler"]',
    );
    elementsWithHandlers.forEach((element) => {
      const onclick = element.getAttribute("onclick");
      if (onclick && onclick.includes("fx.invokeHandler")) {
        // Extract handler ID from onclick="fx.invokeHandler('fx_1', event)"
        const match = onclick.match(/fx\.invokeHandler\('([^']+)'.*\)/);
        if (match) {
          const handlerId = match[1];
          // Set up the click event listener with addEventListener for better compatibility
          element.addEventListener("click", (event) => {
            event.preventDefault();
            this.invokeHandler(handlerId, event);
          });
          // Remove the onclick attribute to avoid conflicts
          element.removeAttribute("onclick");
        }
      }
    });
  }
}

// Global fx instance
window.fx = new FXClient();

// Auto-hydrate when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => window.fx.hydrate());
} else {
  window.fx.hydrate();
}
