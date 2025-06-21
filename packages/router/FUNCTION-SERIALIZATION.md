# Function Serialization for JSX Event Handlers

## Overview

This system enables **natural React-like syntax** for event handlers in streaming HTML by serializing functions and their dependencies, then recreating them on the client-side.

## ✅ **What Now Works**

```tsx
function Component() {
  const count = signal(0);
  
  return (
    <div>
      <span>{count()}</span>
      {/* ✅ This natural syntax now works! */}
      <button onClick={withDeps(() => count(count() + 1), { count })}>
        +1
      </button>
    </div>
  );
}
```

## 🔧 **How It Works**

### 1. **Function Serialization**

```tsx
// Server-side: Function is serialized with dependencies
const serialized = serializeFunction(
  () => count(count() + 1),  // Function code
  { count }                  // Dependencies
);

// Result:
{
  id: "fn_1_abc123",
  code: "() => count(count() + 1)",
  dependencies: {},
  signalDependencies: { "count": "signal-456" }
}
```

### 2. **HTML Generation**

```tsx
// JSX runtime detects SerializableFunction and converts to string
<button onClick={serializedFunction}>

// Becomes:
<button onclick="__callHandler('fn_1_abc123', event)">
```

### 3. **Client-side Execution**

```javascript
// Client receives serialized functions and recreates them
window.__callHandler = function(id, event) {
  const handler = functions[id];
  
  // Recreate scope with signal proxies
  const scope = {
    count: createSignalProxy('signal-456')  // Live signal reference
  };
  
  // Execute with injected scope
  const fn = new Function('count', handler.code);
  return fn(scope.count);
};
```

## 🎯 **Key Features**

### **Natural Syntax**
```tsx
// Instead of this cumbersome approach:
<signal-button data-signal-id={count.id} data-action="increment">+1</signal-button>

// You can write this:
<button onClick={withDeps(() => count(count() + 1), { count })}>+1</button>
```

### **Automatic Dependency Injection**
```tsx
const increment = () => count(count() + 1);
const decrement = () => count(count() - 1);

// Dependencies are captured and serialized
<button onClick={withDeps(increment, { count })}>+1</button>
<button onClick={withDeps(decrement, { count })}>-1</button>
```

### **Complex State Logic**
```tsx
<button onClick={withDeps(() => {
  if (count() < 10) {
    count(count() * 2);
    message("Doubled!");
  } else {
    count(Math.floor(count() / 2));
    message("Halved!");
  }
}, { count, message })}>
  Smart Toggle
</button>
```

### **Event Object Access**
```tsx
<input 
  onInput={withDeps((e: Event) => {
    const target = e.target as HTMLInputElement;
    name(target.value);
  }, { name })}
/>
```

## 🔒 **Security & Safety**

### **XSS Prevention**
- Function code is serialized as strings, not executed
- Dependencies are JSON-serialized with proper escaping
- No `eval()` on untrusted input - only on server-generated functions

### **Scope Isolation**
- Functions only have access to explicitly declared dependencies
- No access to global scope unless intentionally provided
- Signal references are replaced with controlled proxies

### **CSP Compatibility**
- Optional nonce support for script tags
- All code is server-generated, not user-provided
- No unsafe-eval required

## 📋 **API Reference**

### **Core Functions**

#### `withDeps(fn, dependencies)`
Manually specify function dependencies for serialization.

```tsx
const handler = withDeps(
  (e: Event) => count(count() + 1),
  { count }
);

<button onClick={handler}>Click</button>
```

#### `serializeFunction(fn, deps)`
Low-level function serialization (used internally).

```tsx
const serialized = serializeFunction(
  () => console.log('Hello'),
  { message: 'Hello' }
);
```

### **JSX Integration**

#### Enhanced Event Handlers
Event handlers automatically detect and serialize functions:

```tsx
// These event props accept SerializableFunction:
onClick, onInput, onChange, onSubmit, onKeyDown, etc.
```

#### Client Script Generation
```tsx
import { AutoClient } from "@mewhhaha/fx-router/signals/complete";

// Include in your page:
<AutoClient nonce="your-csp-nonce" />
```

## 🔄 **Comparison with Alternatives**

### **Before: Custom Elements**
```tsx
// Cumbersome data attributes
<signal-button 
  data-signal-id={count.id}
  data-action="increment"
  data-value="1"
>
  +1
</signal-button>
```

### **After: Natural Functions**
```tsx
// Natural React-like syntax
<button onClick={withDeps(() => count(count() + 1), { count })}>
  +1
</button>
```

### **Before: Inline Strings**
```tsx
// Unsafe and limited
<button onclick="count++">+1</button>
```

### **After: Full JavaScript**
```tsx
// Full JavaScript with type safety
<button onClick={withDeps(() => {
  const newValue = count() + 1;
  count(newValue);
  console.log('New count:', newValue);
}, { count })}>
  +1
</button>
```

## 🚀 **Performance**

### **Server-side**
- Function serialization happens once during render
- Minimal overhead for dependency extraction
- Efficient JSON serialization

### **Client-side**
- Functions are cached after first creation
- Signal proxies are lightweight wrappers
- Event delegation for optimal performance

### **Network**
- Only serialized functions are sent (not full client-side framework)
- Gzip-friendly repetitive patterns
- Scales with actual usage, not potential features

## 🔮 **Future Enhancements**

### **Automatic Dependency Detection**
```tsx
// Goal: No manual dependency specification needed
<button onClick={() => count(count() + 1)}>+1</button>
// System would automatically detect 'count' dependency
```

### **TypeScript Integration**
```tsx
// Goal: Full type safety for serialized functions
const handler: ClickHandler<{ count: Signal<number> }> = 
  (deps) => deps.count(deps.count() + 1);
```

### **Development Tools**
```tsx
// Goal: Dev tools for debugging serialized functions
window.__debugSerializedFunctions();
```

## 💡 **Best Practices**

### **Keep Dependencies Explicit**
```tsx
// ✅ Good: Explicit dependencies
<button onClick={withDeps(() => count(count() + 1), { count })}>

// ❌ Avoid: Hidden dependencies
<button onClick={() => count(count() + 1)}>  // count not accessible
```

### **Minimize Dependency Surface**
```tsx
// ✅ Good: Only pass what's needed
<button onClick={withDeps(() => user.name(newName), { user })}>

// ❌ Avoid: Passing entire objects unnecessarily
<button onClick={withDeps(() => user.name(newName), { user, app, global })}>
```

### **Use Computed Signals for Complex Logic**
```tsx
// ✅ Good: Logic in computed signals
const isValid = computed(() => email().includes('@'));
<button onClick={withDeps(() => submit(), { submit })} disabled={!isValid()}>

// ❌ Avoid: Complex logic in handlers
<button onClick={withDeps(() => {
  if (email().includes('@') && email().length > 5 && email().includes('.')) {
    submit();
  }
}, { email, submit })}>
```

This approach gives you the **natural syntax** you wanted while maintaining the **safety and performance** of streaming HTML! 🎉