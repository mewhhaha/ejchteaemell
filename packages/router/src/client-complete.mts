import { getActiveSignals } from "./signals.mts";
import { getSerializedFunctions } from "./function-serializer.mts";

export type CompleteClientOptions = {
  nonce?: string;
  includeSignals?: boolean;
  includeFunctions?: boolean;
};

export function CompleteClient({ 
  nonce, 
  includeSignals = true, 
  includeFunctions = true 
}: CompleteClientOptions = {}): string {
  const signals = includeSignals ? getActiveSignals() : {};
  const functions = includeFunctions ? getSerializedFunctions() : [];
  const nonceAttribute = nonce ? ` nonce="${nonce}"` : "";

  if (Object.keys(signals).length === 0 && functions.length === 0) {
    return '';
  }

  const functionDefs = functions.map(fn => {
    const { id, code, dependencies, signalDependencies } = fn;
    
    return `
    functions['${id}'] = {
      fn: ${code},
      deps: ${JSON.stringify(dependencies)},
      signalDeps: ${JSON.stringify(signalDependencies)}
    };`;
  }).join('\n');

  return `
<script type="application/javascript"${nonceAttribute}>
(function() {
  // ======================
  // SIGNALS SYSTEM
  // ======================
  
  ${includeSignals ? `
  // Client-side signal registry
  const signals = ${JSON.stringify(signals)};
  const subscribers = new Map();
  
  // Signal management
  function getSignal(id) {
    return signals[id];
  }
  
  function setSignal(id, value) {
    if (signals[id] !== value) {
      signals[id] = value;
      const subs = subscribers.get(id);
      if (subs) {
        subs.forEach(callback => callback(value));
      }
      updateSignalElements(id, value);
    }
  }
  
  function subscribe(id, callback) {
    if (!subscribers.has(id)) {
      subscribers.set(id, new Set());
    }
    subscribers.get(id).add(callback);
    return () => subscribers.get(id)?.delete(callback);
  }
  
  // Update DOM elements that depend on signals
  function updateSignalElements(signalId, newValue) {
    const elements = document.querySelectorAll('[data-signals]');
    elements.forEach(element => {
      try {
        const signalData = JSON.parse(element.getAttribute('data-signals'));
        
        // Update props
        for (const [propName, signalInfo] of Object.entries(signalData.props || {})) {
          if (signalInfo.id === signalId) {
            if (propName === 'textContent' || propName === 'innerText') {
              element[propName] = newValue;
            } else if (propName === 'value' && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
              element.value = newValue;
            } else if (propName.startsWith('class')) {
              element.className = newValue;
            } else {
              element.setAttribute(propName, newValue);
            }
          }
        }
        
        // Update children
        if (signalData.children) {
          signalData.children.forEach(childSignal => {
            if (childSignal.id === signalId) {
              element.textContent = newValue;
            }
          });
        }
      } catch (e) {
        console.warn('Failed to parse signal data:', e);
      }
    });
    
    // Also update elements with data-signal-id
    document.querySelectorAll(\`[data-signal-id="\${signalId}"]\`).forEach(element => {
      element.textContent = newValue;
    });
  }
  
  // Custom element classes
  class SignalElement extends HTMLElement {
    connectedCallback() {
      this.setupSignalBindings();
    }
    
    setupSignalBindings() {
      const signalData = this.getAttribute('data-signals');
      if (!signalData) return;
      
      try {
        const data = JSON.parse(signalData);
        
        // Set up initial values
        Object.entries(data.props || {}).forEach(([propName, signalInfo]) => {
          const currentValue = getSignal(signalInfo.id);
          if (propName === 'value' && (this.tagName === 'INPUT' || this.tagName === 'TEXTAREA')) {
            this.value = currentValue;
          } else if (propName.startsWith('class')) {
            this.className = currentValue;
          } else if (propName !== 'children') {
            this.setAttribute(propName, currentValue);
          }
        });
        
        // Set up children signals
        if (data.children) {
          data.children.forEach(childSignal => {
            if (childSignal.type === 'signal') {
              this.textContent = getSignal(childSignal.id);
            }
          });
        }
      } catch (e) {
        console.warn('Failed to setup signal bindings:', e);
      }
    }
  }
  
  class SignalButton extends HTMLElement {
    connectedCallback() {
      const signalId = this.getAttribute('data-signal-id');
      const action = this.getAttribute('data-action');
      const value = this.getAttribute('data-value');
      
      if (!signalId) return;
      
      this.addEventListener('click', () => {
        const currentValue = getSignal(signalId);
        
        if (action === 'increment' && typeof currentValue === 'number') {
          setSignal(signalId, currentValue + 1);
        } else if (action === 'decrement' && typeof currentValue === 'number') {
          setSignal(signalId, currentValue - 1);
        } else if (action === 'toggle' && typeof currentValue === 'boolean') {
          setSignal(signalId, !currentValue);
        } else if (action === 'set' && value !== null) {
          let newValue = value;
          try {
            newValue = JSON.parse(value);
          } catch (e) {
            // Keep as string if not valid JSON
          }
          setSignal(signalId, newValue);
        }
      });
    }
  }
  
  class SignalInput extends HTMLElement {
    connectedCallback() {
      const signalId = this.getAttribute('data-signal-id');
      if (!signalId) return;
      
      const input = this.querySelector('input, textarea, select');
      if (!input) return;
      
      // Set initial value
      input.value = getSignal(signalId);
      
      // Update signal on input change
      input.addEventListener('input', () => {
        let value = input.value;
        const type = this.getAttribute('data-type');
        
        if (type === 'number') {
          value = parseFloat(value) || 0;
        } else if (type === 'boolean') {
          value = input.checked;
        }
        
        setSignal(signalId, value);
      });
      
      // Update input when signal changes
      subscribe(signalId, (newValue) => {
        if (input.value !== newValue) {
          input.value = newValue;
        }
      });
    }
  }
  
  // Register custom elements
  if (!customElements.get('signal-element')) {
    customElements.define('signal-element', SignalElement);
  }
  if (!customElements.get('signal-button')) {
    customElements.define('signal-button', SignalButton);
  }
  if (!customElements.get('signal-input')) {
    customElements.define('signal-input', SignalInput);
  }
  
  // Global signal API
  window.signals = {
    get: getSignal,
    set: setSignal,
    subscribe: subscribe,
  };
  ` : ''}
  
  // ======================
  // FUNCTION SERIALIZATION SYSTEM
  // ======================
  
  ${includeFunctions ? `
  // Function registry
  const functions = {};
  
  ${functionDefs}
  
  // Create signal proxies that work like the original signals
  function createSignalProxy(signalId) {
    const proxy = function(newValue) {
      if (arguments.length === 0) {
        // Getter
        return window.signals ? window.signals.get(signalId) : undefined;
      } else {
        // Setter
        if (window.signals) {
          window.signals.set(signalId, newValue);
        }
        return newValue;
      }
    };
    proxy.id = signalId;
    return proxy;
  }
  
  // Global function to call handlers
  window.__callHandler = function(id) {
    const handler = functions[id];
    if (!handler) {
      console.warn('Handler not found:', id);
      return;
    }
    
    // Create scope with dependencies
    const scope = { ...handler.deps };
    
    // Add signal proxies
    for (const [varName, signalId] of Object.entries(handler.signalDeps)) {
      scope[varName] = createSignalProxy(signalId);
    }
    
    // Get the remaining arguments (event, etc.)
    const args = Array.prototype.slice.call(arguments, 1);
    
    // Create a function with the scope injected
    const scopeKeys = Object.keys(scope);
    const scopeValues = Object.values(scope);
    
    try {
      // Create function with injected scope
      const executableFn = new Function(...scopeKeys, \`
        return (\${handler.fn}).apply(this, arguments);
      \`);
      
      return executableFn.apply(this, [...scopeValues, ...args]);
    } catch (error) {
      console.error('Error executing handler:', error, handler);
    }
  };
  ` : ''}
  
  // ======================
  // INITIALIZATION
  // ======================
  
  // Initialize existing signal elements
  document.querySelectorAll('[data-signal-id]').forEach(element => {
    if (element instanceof SignalElement) {
      element.setupSignalBindings();
    }
  });
  
  console.log('FX Router client initialized', {
    signals: Object.keys(signals || {}).length,
    functions: Object.keys(functions || {}).length
  });
})();
</script>`;
}

// Convenience function that automatically detects what's needed
export function AutoClient(options: CompleteClientOptions = {}): string {
  const signals = getActiveSignals();
  const functions = getSerializedFunctions();
  
  return CompleteClient({
    ...options,
    includeSignals: Object.keys(signals).length > 0,
    includeFunctions: functions.length > 0,
  });
}