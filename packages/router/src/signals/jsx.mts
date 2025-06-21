import { jsx as baseJsx } from "../runtime/jsx-runtime.mts";
import { into, type Html } from "../runtime/node.mts";
import type { Signal, ComputedSignal } from "./core.mts";

type SignalValue<T> = Signal<T> | ComputedSignal<T>;

export function SignalText<T>(props: { 
  signal: SignalValue<T>;
  transform?: (value: T) => string;
}): Html {
  const { signal, transform } = props;
  const value = transform ? transform(signal.value) : String(signal.value);
  
  return baseJsx("span", {
    children: value,
    "data-fx-signal": signal.id,
    "data-fx-type": "text"
  });
}

export function SignalButton<T>(props: {
  signal: SignalValue<T>;
  onClick: (current: T) => T;
  children: unknown;
  class?: string;
  disabled?: boolean;
}): Html {
  const { signal, onClick, children, ...otherProps } = props;
  
  const clickHandler = `
    const current = signals.get('${signal.id}');
    const newValue = (${onClick.toString()})(current);
    signals.update('${signal.id}', newValue);
  `;
  
  return baseJsx("button", {
    ...otherProps,
    children,
    "data-fx-click": clickHandler,
    type: "button"
  });
}

export function SignalInput<T extends string | number>(props: {
  signal: SignalValue<T>;
  type?: "text" | "number" | "email" | "password";
  placeholder?: string;
  class?: string;
  disabled?: boolean;
}): Html {
  const { signal, type = "text", ...otherProps } = props;
  
  const inputHandler = `
    const value = event.target.value;
    const convertedValue = ${type === 'number' ? 'Number(value)' : 'value'};
    signals.update('${signal.id}', convertedValue);
  `;
  
  return baseJsx("input", {
    ...otherProps,
    type,
    value: String(signal.value),
    "data-fx-signal": signal.id,
    "data-fx-input": inputHandler,
    "data-fx-type": "input"
  });
}

export function SignalConditional<T>(props: {
  signal: SignalValue<T>;
  condition: (value: T) => boolean;
  children: unknown;
  fallback?: unknown;
}): Html {
  const { signal, condition, children, fallback } = props;
  const shouldShow = condition(signal.value);
  
  return baseJsx("div", {
    children: shouldShow ? children : (fallback || null),
    "data-fx-signal": signal.id,
    "data-fx-type": "conditional",
    "data-fx-condition": condition.toString(),
    style: shouldShow ? undefined : "display: none;"
  });
}

export function SignalList<T>(props: {
  signal: SignalValue<T[]>;
  renderItem: (item: T, index: number) => unknown;
  keyFn?: (item: T, index: number) => string;
  class?: string;
}): Html {
  const { signal, renderItem, keyFn, ...otherProps } = props;
  const items = signal.value;
  
  const children = items.map((item, index) => {
    const key = keyFn ? keyFn(item, index) : String(index);
    return baseJsx("div", {
      key,
      children: renderItem(item, index),
      "data-fx-item-key": key
    });
  });
  
  return baseJsx("div", {
    ...otherProps,
    children,
    "data-fx-signal": signal.id,
    "data-fx-type": "list"
  });
}

export function createSignalScript(serializedState: Record<string, any>): Html {
  const clientCode = `
    (function() {
      window.FxSignals = {
        state: ${JSON.stringify(serializedState)},
        signals: new Map(),
        
        init() {
          Object.entries(this.state).forEach(([id, value]) => {
            this.signals.set(id, {
              id,
              value,
              listeners: new Set()
            });
          });
          
          this.setupEventListeners();
          this.bindElements();
        },
        
        update(id, newValue) {
          const signal = this.signals.get(id);
          if (!signal || signal.value === newValue) return;
          
          signal.value = newValue;
          signal.listeners.forEach(listener => listener());
          this.updateBoundElements(id, newValue);
        },
        
        get(id) {
          return this.signals.get(id)?.value;
        },
        
        setupEventListeners() {
          document.addEventListener('click', (event) => {
            const target = event.target;
            const clickHandler = target.getAttribute('data-fx-click');
            if (clickHandler) {
              try {
                const fn = new Function('event', 'signals', clickHandler);
                fn(event, { update: this.update.bind(this), get: this.get.bind(this) });
              } catch (error) {
                console.error('Click handler error:', error);
              }
            }
          });
          
          document.addEventListener('input', (event) => {
            const target = event.target;
            const inputHandler = target.getAttribute('data-fx-input');
            if (inputHandler) {
              try {
                const fn = new Function('event', 'signals', inputHandler);
                fn(event, { update: this.update.bind(this), get: this.get.bind(this) });
              } catch (error) {
                console.error('Input handler error:', error);
              }
            }
          });
        },
        
        bindElements() {
          document.querySelectorAll('[data-fx-signal]').forEach(el => {
            const signalId = el.getAttribute('data-fx-signal');
            const type = el.getAttribute('data-fx-type');
            
            if (type === 'text') {
              this.bindTextElement(el, signalId);
            } else if (type === 'conditional') {
              this.bindConditionalElement(el, signalId);
            } else if (type === 'input') {
              this.bindInputElement(el, signalId);
            }
          });
        },
        
        bindTextElement(element, signalId) {
          const signal = this.signals.get(signalId);
          if (signal) {
            element.textContent = String(signal.value);
            signal.listeners.add(() => {
              element.textContent = String(this.signals.get(signalId).value);
            });
          }
        },
        
        bindConditionalElement(element, signalId) {
          const signal = this.signals.get(signalId);
          const conditionStr = element.getAttribute('data-fx-condition');
          if (signal && conditionStr) {
            const condition = new Function('value', 'return ' + conditionStr);
            const updateVisibility = () => {
              const shouldShow = condition(this.signals.get(signalId).value);
              element.style.display = shouldShow ? '' : 'none';
            };
            updateVisibility();
            signal.listeners.add(updateVisibility);
          }
        },
        
        bindInputElement(element, signalId) {
          const signal = this.signals.get(signalId);
          if (signal) {
            element.value = String(signal.value);
            signal.listeners.add(() => {
              if (document.activeElement !== element) {
                element.value = String(this.signals.get(signalId).value);
              }
            });
          }
        },
        
        updateBoundElements(signalId, newValue) {
          document.querySelectorAll(\`[data-fx-signal="\${signalId}"]\`).forEach(el => {
            const type = el.getAttribute('data-fx-type');
            if (type === 'text') {
              el.textContent = String(newValue);
            } else if (type === 'conditional') {
              const conditionStr = el.getAttribute('data-fx-condition');
              if (conditionStr) {
                const condition = new Function('value', 'return ' + conditionStr);
                el.style.display = condition(newValue) ? '' : 'none';
              }
            } else if (type === 'input' && document.activeElement !== el) {
              el.value = String(newValue);
            }
          });
        }
      };
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.FxSignals.init());
      } else {
        window.FxSignals.init();
      }
    })();
  `;
  
  return baseJsx("script", {
    children: clientCode,
    type: "text/javascript"
  });
}