import { jsx } from "./src/runtime/jsx-signals.mts";
import { signal } from "./src/signals.mts";
import { ClientSignals } from "./src/client-signals.mts";
import type { Html } from "./src/runtime/node.mts";

// ❌ This won't work (functions don't serialize)
function BrokenComponent(): Html {
  const count = signal(0);
  return jsx("div", {
    children: [
      jsx("output", { 
        children: `The current count is: ${count()}` 
      }),
      jsx("button", {
        // ❌ This onClick handler won't work on the client
        onClick: () => count(1),
        children: "Set to 1"
      })
    ]
  });
}

// ✅ This works (using custom elements)
function WorkingComponent(): Html {
  const count = signal(0);
  
  return jsx("div", {
    children: [
      jsx("output", { 
        children: [
          "The current count is: ",
          // This will update when count changes
          jsx("span", {
            "data-signal-id": count.id,
            children: count()
          })
        ]
      }),
      jsx("signal-button", {
        "data-signal-id": count.id,
        "data-action": "set",
        "data-value": "1",
        children: "Set to 1",
        style: "padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
      })
    ]
  });
}

// ✅ Even better - using helper components
function BestComponent(): Html {
  const count = signal(0);
  
  return jsx("div", {
    children: [
      jsx("output", { 
        children: [
          "The current count is: ",
          // SignalDisplay helper handles the data attributes
          jsx("span", {
            "data-signal-id": count.id,
            children: count()
          })
        ]
      }),
      jsx("div", {
        style: "margin-top: 10px; display: flex; gap: 10px;",
        children: [
          jsx("signal-button", {
            "data-signal-id": count.id,
            "data-action": "increment",
            children: "+1",
            style: "padding: 4px 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
          }),
          jsx("signal-button", {
            "data-signal-id": count.id,
            "data-action": "decrement", 
            children: "-1",
            style: "padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
          }),
          jsx("signal-button", {
            "data-signal-id": count.id,
            "data-action": "set",
            "data-value": "0",
            children: "Reset",
            style: "padding: 4px 8px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
          })
        ]
      })
    ]
  });
}

// 🚀 Complete working page
export function ComponentExamplePage(): Html {
  return jsx("html", {
    children: [
      jsx("head", {
        children: [
          jsx("title", { children: "Component Signal Example" }),
          jsx("style", {
            children: `
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
              .example { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
              .example h3 { margin-top: 0; }
              output { font-size: 18px; font-weight: bold; display: block; margin-bottom: 10px; }
            `
          })
        ]
      }),
      jsx("body", {
        children: [
          jsx("h1", { children: "Signal Components Example" }),
          
          jsx("div", {
            class: "example",
            children: [
              jsx("h3", { children: "Working Component" }),
              jsx("p", { children: "Uses custom elements for interactivity:" }),
              WorkingComponent()
            ]
          }),
          
          jsx("div", {
            class: "example", 
            children: [
              jsx("h3", { children: "Enhanced Component" }),
              jsx("p", { children: "With multiple button actions:" }),
              BestComponent()
            ]
          }),

          // Include the client-side signals script
          ClientSignals({ nonce: undefined })
        ]
      })
    ]
  });
}

// 🎯 Alternative approach: Global signals (shared across components)
const globalCount = signal(0);

function ComponentWithGlobalSignal(): Html {
  return jsx("div", {
    style: "padding: 20px; border: 2px solid #007bff; border-radius: 8px; margin: 10px 0;",
    children: [
      jsx("p", { 
        children: [
          "Global count: ",
          jsx("strong", {
            "data-signal-id": globalCount.id,
            children: globalCount()
          })
        ]
      }),
      jsx("signal-button", {
        "data-signal-id": globalCount.id,
        "data-action": "increment",
        children: "Increment Global",
        style: "padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
      })
    ]
  });
}

function AnotherComponentWithSameSignal(): Html {
  return jsx("div", {
    style: "padding: 20px; border: 2px solid #28a745; border-radius: 8px; margin: 10px 0;",
    children: [
      jsx("p", { 
        children: [
          "Same global count: ",
          jsx("strong", {
            "data-signal-id": globalCount.id,
            children: globalCount()
          })
        ]
      }),
      jsx("signal-button", {
        "data-signal-id": globalCount.id,
        "data-action": "decrement",
        children: "Decrement Global",
        style: "padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
      })
    ]
  });
}

export function GlobalSignalExample(): Html {
  return jsx("html", {
    children: [
      jsx("head", {
        children: [
          jsx("title", { children: "Global Signals Example" }),
          jsx("style", {
            children: `
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
            `
          })
        ]
      }),
      jsx("body", {
        children: [
          jsx("h1", { children: "Global Signal Sharing" }),
          jsx("p", { children: "Both components share the same signal and update together:" }),
          
          ComponentWithGlobalSignal(),
          AnotherComponentWithSameSignal(),
          
          jsx("p", { 
            style: "margin-top: 20px; padding: 10px; background: #f8f9fa; border-radius: 4px;",
            children: "Notice how both components update when either button is clicked!" 
          }),

          ClientSignals({ nonce: undefined })
        ]
      })
    ]
  });
}