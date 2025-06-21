# FX Router Signals Proposal

## Overview

This proposal introduces a simple, reactive signals system for your FX Router that enables client-side state management with server-side rendering. The system is designed to work with your existing streaming JSX-to-HTML architecture while providing reactive updates in the browser.

## Key Features

- **Server-Side Rendering**: Signals work with your existing streaming JSX system
- **Client-Side Updates**: Reactive DOM updates when signals change
- **Safe State Serialization**: Secure hydration of server state to client
- **Simple API**: Easy-to-use signal creation and management
- **Custom JSX Components**: Pre-built components that bind to signals
- **Event Handling**: Safe event handling with automatic DOM updates

## Core API

### Signal Creation

```typescript
import { signal, computed } from "@mewhhaha/fx-router/signals";

const count = signal(0);
const doubleCount = computed(() => count.value * 2);

count.set(5);
console.log(doubleCount.value); // 10
```

### Reactive JSX Components

```typescript
import { SignalText, SignalButton, SignalInput } from "@mewhhaha/fx-router/signals";

function Counter() {
  const count = signal(0);
  
  return jsx("div", {
    children: [
      SignalText({ signal: count }),
      SignalButton({
        signal: count,
        onClick: (current) => current + 1,
        children: "Increment"
      })
    ]
  });
}
```

## Architecture

### 1. Server-Side Signals (`core.mts`)

The core signals implementation runs on the server:

- `signal<T>(value)` - Creates a mutable signal
- `computed<T>(fn)` - Creates a computed signal that derives from other signals
- `serializeSignals()` - Serializes all signal state for client hydration
- `hydrateSignals(state)` - Restores signal state from serialized data

### 2. Client-Side Runtime (`client.mts`)

The client-side runtime handles DOM updates:

- Initializes signals from server state
- Binds DOM elements to signals
- Updates elements when signals change
- Handles events safely

### 3. JSX Components (`jsx.mts`)

Pre-built components that work with signals:

- `SignalText` - Displays signal values
- `SignalButton` - Buttons that update signals on click
- `SignalInput` - Input fields bound to signals
- `SignalConditional` - Conditional rendering based on signals
- `SignalList` - Lists that update when array signals change

### 4. State Hydration

The `createSignalScript()` function generates JavaScript that:

- Serializes server state safely
- Initializes client-side signals
- Sets up event listeners
- Binds DOM elements to signals

## Usage Examples

### Simple Counter

```typescript
function Counter() {
  const count = signal(0);
  
  return jsx("div", {
    children: [
      jsx("h2", { children: "Counter" }),
      jsx("p", { children: ["Count: ", SignalText({ signal: count })] }),
      SignalButton({
        signal: count,
        onClick: (current) => current + 1,
        children: "+"
      }),
      SignalButton({
        signal: count,
        onClick: (current) => current - 1,
        children: "-"
      })
    ]
  });
}
```

### Form with Validation

```typescript
function LoginForm() {
  const email = signal("");
  const password = signal("");
  const isValid = computed(() => 
    email.value.includes("@") && password.value.length >= 6
  );
  
  return jsx("form", {
    children: [
      SignalInput({
        signal: email,
        type: "email",
        placeholder: "Email"
      }),
      SignalInput({
        signal: password,
        type: "password",
        placeholder: "Password"
      }),
      SignalConditional({
        signal: isValid,
        condition: (valid) => valid,
        children: jsx("button", { 
          children: "Login",
          type: "submit"
        }),
        fallback: jsx("p", { children: "Please fill in valid credentials" })
      })
    ]
  });
}
```

### Todo List

```typescript
function TodoApp() {
  const todos = signal([]);
  const newTodo = signal("");
  
  return jsx("div", {
    children: [
      jsx("div", {
        children: [
          SignalInput({
            signal: newTodo,
            placeholder: "Add todo..."
          }),
          jsx("button", {
            children: "Add",
            "data-fx-click": `
              const text = signals.get('${newTodo.id}');
              if (text.trim()) {
                const todos = signals.get('${todos.id}');
                signals.update('${todos.id}', [...todos, { 
                  id: Date.now(), 
                  text: text.trim(), 
                  completed: false 
                }]);
                signals.update('${newTodo.id}', '');
              }
            `
          })
        ]
      }),
      SignalList({
        signal: todos,
        renderItem: (todo) => jsx("div", {
          children: [
            jsx("input", { 
              type: "checkbox", 
              checked: todo.completed 
            }),
            jsx("span", { children: todo.text })
          ]
        })
      })
    ]
  });
}
```

## Complete App Structure

```typescript
import { jsx } from "@mewhhaha/fx-router/jsx-runtime";
import { 
  signal, 
  serializeSignals, 
  createSignalScript 
} from "@mewhhaha/fx-router/signals";

function App() {
  // Create your signals and components
  const myComponent = Counter();
  
  // Serialize state for client
  const state = serializeSignals();
  
  return jsx("html", {
    children: [
      jsx("head", { children: jsx("title", { children: "My App" }) }),
      jsx("body", { 
        children: [
          myComponent,
          createSignalScript(state) // This handles client-side hydration
        ]
      })
    ]
  });
}
```

## Security Considerations

### Safe Event Handling

Event handlers are serialized as strings and executed in a controlled environment:

```typescript
// Server-side
jsx("button", {
  "data-fx-click": `
    const currentValue = signals.get('${signalId}');
    signals.update('${signalId}', currentValue + 1);
  `
})
```

The client runtime provides a safe `signals` object with only `get` and `update` methods.

### State Serialization

Only serializable signal values are sent to the client. Functions and complex objects are not serialized.

## Implementation Notes

### Performance

- Signals use simple equality checks for updates
- Client-side updates are batched automatically
- Computed signals cache their values until dependencies change
- DOM updates only occur when signal values actually change

### Limitations

- No automatic dependency tracking in computed signals (must be explicit)
- Event handlers are executed as strings (security consideration)
- No built-in persistence (signals reset on page reload)
- Simple implementation prioritizes clarity over performance

## Integration with FX Router

This signals system integrates seamlessly with your existing FX Router:

1. **Streaming HTML**: Signals render their initial values during server-side rendering
2. **Client Hydration**: The generated script initializes client-side reactivity
3. **Safe Updates**: Event handlers use a controlled environment for state updates
4. **Type Safety**: Full TypeScript support with your existing JSX types

## Future Enhancements

Potential improvements could include:

- Automatic dependency tracking for computed signals
- Signal persistence to localStorage
- Development tools for debugging signals
- Optimized DOM diffing for complex updates
- WebSocket synchronization for real-time updates

This proposal provides a solid foundation for reactive state management while maintaining the simplicity and security of your existing architecture.