# FX-Router Project Status

## Project Setup

- **Package Manager**: pnpm
- **Test Runner**: vitest with jsdom
- **Runtime**: Node.js with TypeScript

## Current Architecture

### CSP-Safe Script Tag Approach ✅

We've implemented a CSP-compliant handler system using script tags:

- **No `new Function()` or `eval()`** - fully CSP-safe
- **Function deduplication** - identical functions share same hash
- **Script tag registration** - handlers registered via `fx.registerFunction(hash, fn)`
- **Reference by hash** - handlers reference functions by hash ID

### Function Deduplication Strategy

**Process:**

1. **Hash functions** - Generate hash from processed function string
2. **Deduplicate** - Only emit unique functions once per hash
3. **Reference** - Multiple handlers can reference same function hash

**Benefits:**

- **Reduced HTML size** - No duplicate function definitions
- **Better performance** - Functions cached by hash
- **Cleaner output** - Separates function definitions from handler bindings

### Context Stack Approach

We've implemented a context stack system for signal management:

- Each component gets its own isolated signal namespace
- Components push/pop contexts as they execute
- Signals are automatically detected from component source code
- Variable names are extracted via regex parsing

### Key Files

- `runtime/signal-context.mts` - Context stack management
- `runtime/jsx-runtime.mts` - Component rendering and handler processing
- `runtime/closure-capture.mts` - Handler transformation
- `runtime/serializer.mts` - HTML serialization with script tags and deduplication
- `public/fx-client.js` - Client-side function/handler registration and signal restoration

## Testing Strategy

### Framework Setup

- **Testing Library**: `@testing-library/dom` for DOM queries
- **Environment**: vitest's built-in jsdom (no custom JSDOM setup needed)
- **Mock Strategy**: Custom MockFXClient that replicates real fx-client behavior

### Test File Structure: `test/fx-router-tdd.test.tsx`

**Progressive Complexity Approach:**

1. **Level 1**: Basic signal creation and value access
2. **Level 2**: Single component rendering with signals
3. **Level 3**: Multiple independent components
4. **Level 4**: Event handlers accessing component signals
5. **Level 5**: Multiple components with independent handlers
6. **Level 6**: Nested components with separate contexts
7. **Level 7**: Complex multi-component interactions
8. **Level 8**: Async component limitations (documents known limits)

### Testing Best Practices

**Setup Pattern:**

```typescript
beforeEach(() => {
  clear(); // Clear signal context
  document.body.innerHTML = ""; // Reset DOM
  const fx = new MockFXClient(); // Fresh mock client
  (global as any).fx = fx;
});
```

**Test Pattern:**

```typescript
test("Level X: Description", () => {
  // 1. Define components with signals/handlers
  function Component() {
    const signal = useSignal(initialValue);
    return <div onClick={() => signal.value++}>...</div>;
  }

  // 2. Render to HTML
  const html = renderHTML(<Component />);
  document.body.innerHTML = html;

  // 3. Hydrate for interactive tests
  (global as any).fx.hydrate(); // Only for tests with event handlers

  // 4. Query using accessibility-based selectors
  const button = getByRole(document.body, "button", { name: "..." });

  // 5. Interact and assert
  button.click();
  expect(getByText(document.body, "expected")).toBeTruthy();
});
```

**Key Testing Principles:**

- Use accessibility-based queries (`getByRole`, `getByLabelText`, `getByText`)
- Test signal isolation between component instances
- Verify event handlers access correct signal context
- Always hydrate before testing interactions
- Use clear, descriptive aria-labels for complex components

### Mock Strategy

**MockFXClient Features:**

- Parses HTML comments for state/handlers/bindings (like real client)
- Restores signals with full reactivity
- Sets up event listeners and removes attributes
- Handles DOM updates on signal changes
- Provides same API as real fx-client.js

## Server-to-Client Communication Flow

### Step-by-Step Process

**1. Component Execution (Server-Side)**

```typescript
function Counter() {
  const count = useSignal(0); // Creates signal in current context
  return <button onClick={() => count.value++}>Count: {count}</button>;
}
```

**2. Context Stack Management**

- `pushComponentContext()` creates isolated namespace for component
- `useSignal()` creates signal with auto-detected variable name "count"
- Signal gets unique ID like "count_1" within component namespace
- `popComponentContext()` when component finishes

**3. Handler Transformation**

```typescript
// Original handler: () => count.value++
// Becomes: fx.invokeHandler('fx_handler_1', event)
// Handler function stored with signal references intact
```

**4. HTML Serialization with CSP-Safe Script Tags**

```html
<!-- fx:state:count_1:{"id":"count_1","value":0} -->
<!-- fx:binding:count_1:["node_123"] -->
<script>
  fx.registerFunction("abc123", () => {
    fx.getSignal("count_1").value++;
  });
</script>
<script>
  fx.registerHandler("fx_handler_1", "abc123");
</script>
<button onclick="fx.invokeHandler('fx_handler_1', event)">
  Count: <span id="node_123">0</span>
</button>
```

**5. Client-Side Hydration**

```javascript
// In real browsers: Script tags execute automatically when added to DOM
// In JSDOM (testing): Scripts need manual execution via eval()

// fx-client.js parses HTML comments and executes scripts
fx.parseComments(); // Extracts state and bindings

// Script tags execute automatically in browsers, manually in JSDOM
fx.registerFunction("abc123", () => {
  fx.getSignal("count_1").value++;
});
fx.registerHandler("fx_handler_1", "abc123");

// Restores signals with reactivity
signal = {
  id: "count_1",
  _value: 0,
  _subscribers: new Set(),
  get value() {
    return this._value;
  },
  set value(v) {
    /* triggers subscribers */
  },
};

// Sets up DOM bindings
signal.subscribe(() => {
  document.getElementById("node_123").textContent = signal.value;
});

// Replaces onclick attributes with real event listeners
element.addEventListener("click", (event) =>
  fx.invokeHandler("fx_handler_1", event),
);
```

**6. Client-Side Interaction**

```javascript
// User clicks button
button.click();

// Triggers handler: fx.invokeHandler('fx_handler_1', event)
// Handler executes: count.value++
// Signal value changes: 0 → 1
// Subscribers triggered: DOM updates automatically
// User sees: "Count: 1"
```

### Key Technical Details

**Signal Context Isolation:**

- Each component instance gets unique signal namespace
- Variable name "count" becomes "count_1", "count_2", etc.
- Context stack prevents signal ID collisions between components

**Handler Closure Capture:**

- Original handler functions serialized as strings
- Signal variable references preserved in serialized code
- Client-side restoration recreates function with signal access

**DOM Binding Strategy:**

- Signal values rendered as spans with unique IDs
- HTML comments store binding relationships
- Client subscribes to signal changes for automatic DOM updates

**State Persistence:**

- Server-rendered HTML contains complete application state
- No separate API calls needed for hydration
- Client can restore exact server state from HTML comments

## Current Status: MAJOR SUCCESS! 🎉

**Context Stack Implementation: WORKING PERFECTLY**

✅ **What's Working:**

- Multiple independent components with isolated signals
- Event handlers with proper signal context
- Nested components with separate signal namespaces
- Context stack push/pop working correctly
- Signal variable name detection working
- Handler transformation working
- Client-side restoration working
- Full DOM testing with accessibility queries

**Test Results:**

- ✅ **Level 1**: Basic signal creation ✅ PASSING
- ✅ **Level 2**: Single component rendering ✅ PASSING
- ✅ **Level 3**: Multiple components ✅ PASSING (context stack working!)
- ✅ **Level 4**: Event handlers ✅ PASSING (handler context working!)
- ✅ **Level 5**: Multiple handlers ✅ PASSING (context isolation working!)
- ✅ **Level 6**: Nested components ✅ PASSING (stack working perfectly!)
- ✅ **Level 7**: Complex interactions ✅ PASSING (all component instances isolated!)
- ✅ **Level 8**: Async limitation ✅ PASSING (limitation documented correctly)

**🎯 ALL 8 LEVELS PASSING! 100% SUCCESS!**

## ✅ COMPLETE SUCCESS - NO ISSUES REMAINING

**All TDD levels are now passing!** The FX-Router context stack implementation is fully functional and robust.

## Async Component Limitation

Due to the synchronous context stack approach, async components are not supported. This is a documented architectural limitation.

## Commands

```bash
# Run tests
pnpm test

# Run specific test file
pnpm vitest test/fx-router-tdd.test.tsx
```
