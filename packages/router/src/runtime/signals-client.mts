export function generateSignalsClient(): string {
  return `
<script>
(function() {
  const signals = new Map();
  const bindings = new Map();
  
  function createSignal(id, initialValue) {
    const subscribers = new Set();
    let value = initialValue;
    
    const signal = {
      get: () => value,
      set: (newValue) => {
        if (value !== newValue) {
          value = newValue;
          subscribers.forEach(fn => fn());
        }
      },
      subscribe: (fn) => {
        subscribers.add(fn);
        return () => subscribers.delete(fn);
      }
    };
    
    signals.set(id, signal);
    return signal;
  }
  
  function bindElement(element, signalId, type, property) {
    const signal = signals.get(signalId);
    if (!signal) return;
    
    const binding = {
      element,
      signalId,
      type,
      property,
      update: () => {
        const value = signal.get();
        if (type === 'text') {
          element.textContent = value;
        } else if (type === 'attr') {
          if (value === null || value === undefined || value === false) {
            element.removeAttribute(property);
          } else {
            element.setAttribute(property, value);
          }
        }
      }
    };
    
    const unsubscribe = signal.subscribe(binding.update);
    binding.unsubscribe = unsubscribe;
    
    if (!bindings.has(signalId)) {
      bindings.set(signalId, []);
    }
    bindings.get(signalId).push(binding);
    
    binding.update();
  }
  
  function updateSignal(id, newValue) {
    const signal = signals.get(id);
    if (signal) {
      signal.set(newValue);
    }
  }
  
  function initializeSignals() {
    document.querySelectorAll('[data-signal-id]').forEach(element => {
      const signalId = element.getAttribute('data-signal-id');
      const type = element.getAttribute('data-signal-type');
      const property = element.getAttribute('data-signal-property');
      const initialValue = element.getAttribute('data-signal-value');
      
      if (!signals.has(signalId)) {
        createSignal(signalId, JSON.parse(initialValue || 'null'));
      }
      
      bindElement(element, signalId, type, property);
    });
    
    document.querySelectorAll('[data-signal-action]').forEach(element => {
      const action = JSON.parse(element.getAttribute('data-signal-action'));
      element.addEventListener(action.event, (e) => {
        if (action.type === 'set') {
          updateSignal(action.signalId, action.value);
        } else if (action.type === 'update') {
          const signal = signals.get(action.signalId);
          if (signal) {
            const currentValue = signal.get();
            if (action.updater === 'increment') {
              signal.set(currentValue + 1);
            } else if (action.updater === 'decrement') {
              signal.set(currentValue - 1);
            } else if (action.updater === 'toggle') {
              signal.set(!currentValue);
            }
          }
        }
      });
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSignals);
  } else {
    initializeSignals();
  }
  
  window.__signals = { updateSignal, createSignal, signals };
})();
</script>
  `.trim();
}