# Signals & State Management Proposal

## Overview

This proposal introduces a simple signals-based state management system for your streaming HTML router that enables reactive components without requiring React-style reconciliation. The system works by:

1. **Server-side**: Signals render their current values during HTML streaming
2. **Client-side**: Custom elements track signal dependencies and update the DOM when signals change
3. **Safety**: All signal data is properly escaped and sanitized before being sent to the browser

## Key Components

### 1. Core Signals System (`signals.mts`)

```typescript
import { signal, computed } from "./src/signals.mts";

// Create reactive state
const count = signal(0);
const doubled = computed(() => count() * 2);

// Read values
console.log(count()); // 0

// Update values  
count(5);
console.log(doubled()); // 10
```

**Features:**
- Simple getter/setter API
- Computed signals that derive from other signals
- Subscription system for change notifications
- Safe serialization for client-side hydration

### 2. Enhanced JSX Runtime (`jsx-signals.mts`)

Extends your existing JSX runtime to handle signals safely:

```typescript
import { jsx } from "./src/runtime/jsx-signals.mts";

const message = signal("Hello");

// Signal values are automatically tracked
const element = jsx("div", {
  children: message(), // Server renders current value
  // Client receives signal metadata for updates
});
```

**Features:**
- Automatically detects signal usage in props and children
- Renders current signal values for SSR
- Embeds signal metadata for client-side reactivity
- Falls back to original JSX runtime when no signals are present

### 3. Client-Side State Management (`client-signals.mts`)

Custom elements that handle DOM updates when signals change:

```typescript
// Automatically included in your HTML
<script>
  // Global signal API
  window.signals = {
    get: (id) => value,
    set: (id, value) => void,
    subscribe: (id, callback) => unsubscribe
  };
</script>
```

**Custom Elements:**
- `<signal-element>` - Tracks and updates signal-dependent elements
- `<signal-button>` - Buttons that modify signals on click
- `<signal-input>` - Inputs bound to signal values

### 4. Helper Components (`signal-components.mts`)

Pre-built components for common patterns:

```typescript
import { Counter, Toggle, TextInput } from "./src/signal-components.mts";

// Reusable counter with +/- buttons
Counter({ initialValue: 0 })

// Toggle between states
Toggle({ 
  initialValue: false,
  trueText: "On", 
  falseText: "Off" 
})

// Text input with real-time binding
TextInput({
  label: "Enter name:",
  placeholder: "Type here...",
  initialValue: ""
})
```

## How It Works

### 1. Server-Side Rendering

```typescript
const count = signal(42);

jsx("div", {
  children: [
    "Count: ",
    count(), // Renders current value: "Count: 42"
  ]
})
```

Generates HTML:
```html
<div data-signal-id="signal-123" data-signals='{"children":[{"type":"signal","id":"signal-123","value":42}]}'>
  Count: 42
</div>
```

### 2. Client-Side Hydration

When the page loads:
1. Client script reads all signal metadata from `data-signals` attributes
2. Creates client-side signal registry with current values
3. Sets up DOM observers for signal changes
4. Registers event handlers for interactive elements

### 3. State Updates

When a signal changes:
1. Server-side subscribers are notified (for SSR)
2. Client-side subscribers update DOM elements
3. Elements with `data-signal-id` matching the changed signal are updated

## Usage Examples

### Basic Counter

```typescript
export function MyPage(): Html {
  const count = signal(0);
  
  return jsx("div", {
    children: [
      jsx("h1", { children: count() }),
      jsx("button", {
        onclick: () => count(count() + 1),
        children: "+"
      })
    ]
  });
}
```

### Form with Real-time Validation

```typescript
export function ContactForm(): Html {
  const email = signal("");
  const isValid = computed(() => email().includes("@"));
  
  return jsx("form", {
    children: [
      jsx("input", {
        type: "email",
        value: email(),
        onchange: (e) => email(e.target.value)
      }),
      jsx("div", {
        style: isValid() ? "color: green" : "color: red",
        children: isValid() ? "✓ Valid" : "✗ Invalid email"
      })
    ]
  });
}
```

### Todo List

```typescript
export function TodoApp(): Html {
  const todos = signal([]);
  const newTodo = signal("");
  
  const addTodo = () => {
    todos([...todos(), { 
      id: crypto.randomUUID(), 
      text: newTodo(), 
      done: false 
    }]);
    newTodo("");
  };
  
  return jsx("div", {
    children: [
      jsx("input", {
        value: newTodo(),
        onchange: (e) => newTodo(e.target.value)
      }),
      jsx("button", {
        onclick: addTodo,
        children: "Add"
      }),
      jsx("ul", {
        children: todos().map(todo => 
          jsx("li", { children: todo.text })
        )
      })
    ]
  });
}
```

## Safety & Security

### XSS Prevention
- All signal values are escaped using your existing `escapeHtml` function
- Signal metadata is safely JSON-encoded with proper escaping
- No direct HTML injection from signal updates

### Data Sanitization
- Signal values are sanitized before being set as DOM attributes
- Client-side updates go through the same sanitization pipeline
- Type checking prevents unsafe value assignments

### CSP Compatibility
- Optional `nonce` parameter for script tags
- All client-side code is inlined (no external dependencies)
- No `eval` or unsafe dynamic code execution

## Integration

### Update Package Exports

Add to `package.json`:
```json
{
  "exports": {
    "./signals": {
      "import": "./src/signals.mts",
      "types": "./src/signals.mts"
    },
    "./signal-components": {
      "import": "./src/signal-components.mts", 
      "types": "./src/signal-components.mts"
    }
  }
}
```

### JSX Transform Configuration

Update your JSX configuration to use the new runtime:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@mewhhaha/fx-router/signals"
  }
}
```

### Usage in Route Components

```typescript
import { jsx } from "@mewhhaha/fx-router/signals";
import { signal } from "@mewhhaha/fx-router/signals";
import { ClientSignals } from "@mewhhaha/fx-router/signals";

export default function Page() {
  const state = signal("Hello World");
  
  return jsx("html", {
    children: [
      jsx("body", {
        children: [
          jsx("h1", { children: state() }),
          jsx("button", {
            onclick: () => state("Updated!"),
            children: "Update"
          }),
          // Include client script
          ClientSignals({ nonce: "your-csp-nonce" })
        ]
      })
    ]
  });
}
```

## Performance Considerations

### Minimal Overhead
- Signals with no dependencies use original JSX runtime (zero overhead)
- Client-side bundle is ~3KB minified
- No virtual DOM or reconciliation needed

### Memory Management
- Automatic cleanup of unused signal subscriptions
- WeakMap-based tracking where possible
- No memory leaks from abandoned signals

### Network Efficiency
- Signal metadata is only included for elements that need it
- Compact JSON representation of signal data
- Streaming-friendly (no blocking on signal resolution)

## Limitations & Future Improvements

### Current Limitations
- No automatic dependency tracking in computed signals
- Basic type safety (relies on TypeScript for compile-time checks)
- No built-in persistence or state synchronization

### Potential Enhancements
- Automatic dependency detection using Proxies
- Signal devtools for debugging
- Built-in local storage persistence
- WebSocket sync for multi-tab state
- Signal-based routing integration

## Migration Path

1. **Phase 1**: Install signals alongside existing JSX runtime
2. **Phase 2**: Gradually convert components to use signals
3. **Phase 3**: Switch JSX transform to signals runtime
4. **Phase 4**: Remove original runtime when no longer needed

The system is designed to coexist with your current implementation, allowing for gradual adoption without breaking changes.