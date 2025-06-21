import { isSignal, type Signal } from "./signals.mts";

export type SerializableFunction = {
  __serializedFunction: true;
  id: string;
  code: string;
  dependencies: Record<string, any>;
  signalDependencies: Record<string, string>; // signal name -> signal id
};

const functionRegistry = new Map<string, SerializableFunction>();

// Global counter for unique function IDs
let functionCounter = 0;

export function serializeFunction<T extends (...args: any[]) => any>(
  fn: T,
  dependencies: Record<string, any> = {}
): SerializableFunction {
  const id = `fn_${++functionCounter}_${crypto.randomUUID().slice(0, 8)}`;
  
  // Extract function code
  const code = fn.toString();
  
  // Separate signals from regular dependencies
  const signalDependencies: Record<string, string> = {};
  const regularDependencies: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(dependencies)) {
    if (isSignal(value)) {
      signalDependencies[key] = value.id;
      regularDependencies[key] = value(); // Current value for SSR
    } else {
      regularDependencies[key] = value;
    }
  }
  
  const serializedFn: SerializableFunction = {
    __serializedFunction: true,
    id,
    code,
    dependencies: regularDependencies,
    signalDependencies,
  };
  
  functionRegistry.set(id, serializedFn);
  return serializedFn;
}

// Auto-detect dependencies from closure
export function autoSerializeFunction<T extends (...args: any[]) => any>(
  fn: T,
  capturedScope: Record<string, any> = {}
): SerializableFunction {
  // Extract variable names from function code
  const code = fn.toString();
  const dependencies: Record<string, any> = {};
  
  // Simple regex to find variable references (not perfect but works for common cases)
  const variableMatches = code.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g) || [];
  const uniqueVars = [...new Set(variableMatches)];
  
  // Filter out keywords, parameters, and built-ins
  const keywords = new Set([
    'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
    'var', 'let', 'const', 'true', 'false', 'null', 'undefined', 'this', 'new', 'typeof', 'instanceof',
    'document', 'window', 'console', 'alert', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'
  ]);
  
  for (const varName of uniqueVars) {
    if (!keywords.has(varName) && capturedScope.hasOwnProperty(varName)) {
      dependencies[varName] = capturedScope[varName];
    }
  }
  
  return serializeFunction(fn, dependencies);
}

// Helper to create event handler with dependencies
export function eventHandler<T extends (...args: any[]) => any>(
  fn: T,
  dependencies: Record<string, any> = {}
): string {
  const serialized = serializeFunction(fn, dependencies);
  return `__callHandler('${serialized.id}', arguments)`;
}

// Get all registered functions for client-side generation
export function getSerializedFunctions(): SerializableFunction[] {
  return Array.from(functionRegistry.values());
}

// Clear registry (useful for testing)
export function clearFunctionRegistry(): void {
  functionRegistry.clear();
  functionCounter = 0;
}

// Check if a value is a serialized function
export function isSerializedFunction(value: any): value is SerializableFunction {
  return value && typeof value === 'object' && value.__serializedFunction === true;
}

// Generate client-side script for all registered functions
export function generateFunctionScript(): string {
  const functions = getSerializedFunctions();
  
  if (functions.length === 0) {
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
<script>
(function() {
  const functions = {};
  const signals = window.signals || {};
  
  ${functionDefs}
  
  // Global function to call handlers
  window.__callHandler = function(id, args) {
    const handler = functions[id];
    if (!handler) {
      console.warn('Handler not found:', id);
      return;
    }
    
    // Create scope with dependencies and current signal values
    const scope = { ...handler.deps };
    
    // Add current signal values
    for (const [varName, signalId] of Object.entries(handler.signalDeps)) {
      if (signals.get) {
        scope[varName] = signals.get(signalId);
      }
    }
    
    // Create a function with the scope injected
    const scopeKeys = Object.keys(scope);
    const scopeValues = Object.values(scope);
    
    try {
      // Create function with injected scope
      const executableFn = new Function(...scopeKeys, 'arguments', \`
        return (\${handler.fn.toString()}).apply(this, arguments);
      \`);
      
      return executableFn.apply(this, [...scopeValues, args]);
    } catch (error) {
      console.error('Error executing handler:', error);
    }
  };
})();
</script>`;
}

// Enhanced version that recreates signals in scope
export function generateAdvancedFunctionScript(): string {
  const functions = getSerializedFunctions();
  
  if (functions.length === 0) {
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
<script>
(function() {
  const functions = {};
  const signals = window.signals || {};
  
  ${functionDefs}
  
  // Create signal proxies that look like the original signals
  function createSignalProxy(signalId) {
    const proxy = function(newValue) {
      if (arguments.length === 0) {
        // Getter
        return signals.get ? signals.get(signalId) : undefined;
      } else {
        // Setter
        if (signals.set) {
          signals.set(signalId, newValue);
        }
        return newValue;
      }
    };
    proxy.id = signalId;
    return proxy;
  }
  
  // Global function to call handlers
  window.__callHandler = function(id, args) {
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
      console.error('Error executing handler:', error);
    }
  };
  
  // Enhanced event delegation for onClick attributes
  document.addEventListener('click', function(event) {
    const target = event.target;
    const onClickAttr = target.getAttribute('onclick');
    
    if (onClickAttr && onClickAttr.includes('__callHandler')) {
      event.preventDefault();
      try {
        eval(onClickAttr);
      } catch (error) {
        console.error('Error in click handler:', error);
      }
    }
  });
})();
</script>`;
}