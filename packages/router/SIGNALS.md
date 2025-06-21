# Signals System

A reactive signals system for your custom JSX components that works with server-side rendering and client-side updates.

## Overview

The signals system provides:
- **Reactive state management** with signals and computed values
- **JSX integration** that works with your existing streaming architecture
- **Client-side updates** without full page reloads
- **Safe serialization** of state to the client

## Core Concepts

### Signals

Create reactive values that can be observed and updated:

```typescript
import { signal } from "@mewhhaha/fx-router/signals";

const count = signal(0);
const name = signal("World");
const isVisible = signal(true);
```

### Computed Values

Create derived values that automatically update when their dependencies change:

```typescript
import { computed } from "@mewhhaha/fx-router/signals";

const count = signal(5);
const doubled = computed(() => count.get() * 2);
```

### Effects

Run side effects when signals change:

```typescript
import { effect } from "@mewhhaha/fx-router/signals";

const count = signal(0);
effect(() => {
  console.log("Count changed to:", count.get());
});
```

## JSX Integration

Signals can be used directly in JSX for both attributes and children:

```typescript
import { jsx } from "@mewhhaha/fx-router/jsx-runtime";
import { signal } from "@mewhhaha/fx-router/signals";

const count = signal(42);
const isVisible = signal(true);

const component = jsx("div", {
  style: isVisible.get() ? "display: block;" : "display: none;",
  children: [
    jsx("p", { children: ["Count: ", count] }),
    jsx("span", { class: count.get() > 10 ? "large" : "small", children: "Status" })
  ]
});
```

### How it Works

- **Attributes**: When a signal is used in an attribute, the JSX runtime adds `data-signal-*` attributes for client-side binding
- **Children**: When a signal is used as a child, it's wrapped in a `<span>` with binding data
- **Client Script**: JavaScript code automatically binds these elements to update when signals change

## Helper Components

### Button Helpers

Pre-built buttons for common operations:

```typescript
import { 
  incrementButton, 
  decrementButton, 
  toggleButton, 
  setButton 
} from "@mewhhaha/fx-router/signal-helpers";

const count = signal(0);
const isVisible = signal(true);

// Increment/decrement buttons
incrementButton(count, { style: "margin: 5px;" });
decrementButton(count);

// Toggle button
toggleButton(isVisible, { children: "Show/Hide" });

// Set specific value
setButton(count, 100, { children: "Set to 100" });
```

### Custom Signal Buttons

Create custom interactive elements:

```typescript
import { signalButton } from "@mewhhaha/fx-router/signal-helpers";

const name = signal("World");

signalButton({
  signal: name,
  action: { type: "set", value: "Alice" },
  event: "click",
  children: "Set Name to Alice",
  class: "my-button"
});
```

## Document Integration

### Full Document with Signals

Wrap your content with the signals client script:

```typescript
import { withSignals } from "@mewhhaha/fx-router/signals-document";
import { jsx } from "@mewhhaha/fx-router/jsx-runtime";
import { signal } from "@mewhhaha/fx-router/signals";

const count = signal(0);

const app = jsx("div", {
  children: [
    jsx("h1", { children: "My App" }),
    jsx("p", { children: ["Count: ", count] })
  ]
});

// Returns complete HTML document with signals support
export const document = withSignals(app);
```

### Manual Script Inclusion

Or include just the script tag:

```typescript
import { signalsScript } from "@mewhhaha/fx-router/signals-document";
import { jsx } from "@mewhhaha/fx-router/jsx-runtime";

const page = jsx("html", {
  children: [
    jsx("head", { children: signalsScript() }),
    jsx("body", { children: "Your content here" })
  ]
});
```

## Complete Example

```typescript
import { jsx } from "@mewhhaha/fx-router/jsx-runtime";
import { signal, computed } from "@mewhhaha/fx-router/signals";
import { incrementButton, decrementButton, toggleButton } from "@mewhhaha/fx-router/signal-helpers";
import { withSignals } from "@mewhhaha/fx-router/signals-document";

export function createCounterApp() {
  // Create signals
  const count = signal(0);
  const isVisible = signal(true);
  
  // Create computed values
  const doubled = computed(() => count.get() * 2);
  const status = computed(() => count.get() > 10 ? "High" : "Low");
  
  // Create the app
  const app = jsx("div", {
    style: "padding: 20px; font-family: Arial, sans-serif;",
    children: [
      jsx("h1", { children: "Counter App" }),
      
      jsx("div", {
        style: isVisible.get() ? "display: block;" : "display: none;",
        children: [
          jsx("p", { children: ["Count: ", count] }),
          jsx("p", { children: ["Doubled: ", doubled] }),
          jsx("p", { children: ["Status: ", status] })
        ]
      }),
      
      jsx("div", {
        style: "margin: 20px 0;",
        children: [
          decrementButton(count, { style: "margin-right: 10px;" }),
          incrementButton(count, { style: "margin-right: 10px;" }),
          toggleButton(isVisible, { children: "Toggle Display" })
        ]
      })
    ]
  });
  
  return withSignals(app);
}
```

## How It Works Under the Hood

1. **Server-Side**: Signals render their current values in HTML with data attributes
2. **Client-Side**: JavaScript initializes signals and binds DOM elements
3. **Updates**: When signals change, bound elements update automatically
4. **Events**: Button clicks trigger signal updates through data attributes

The system is designed to work with your existing streaming HTML architecture while adding reactive capabilities on the client side.

## Type Safety

All signals are fully typed:

```typescript
const count: Signal<number> = signal(0);
const name: Signal<string> = signal("Hello");
const user: Signal<{ id: number; name: string }> = signal({ id: 1, name: "Alice" });

// TypeScript will catch type errors
// count.set("invalid"); // Error: string not assignable to number
```

## Performance Notes

- Signals only re-render when their values actually change
- Computed values are cached and only recalculate when dependencies change
- Client-side updates are batched and efficient
- The system works with existing streaming HTML for optimal performance