import { jsx } from "./runtime/jsx-runtime.mts";
import { signal, computed } from "./signals.mts";
import { incrementButton, decrementButton, toggleButton, setButton } from "./signal-helpers.mts";
import { withSignals } from "./signals-document.mts";
import type { Html } from "./runtime/node.mts";

export function createExample(): Html {
  const count = signal(0);
  const isVisible = signal(true);
  const name = signal("World");
  
  const doubledCount = computed(() => count.get() * 2);
  const greeting = computed(() => `Hello, ${name.get()}!`);
  
  const app = jsx("div", {
    children: [
      jsx("h1", { children: "Signals Example" }),
      
      jsx("div", {
        style: "margin: 20px 0;",
        children: [
          jsx("h2", { children: "Counter" }),
          jsx("p", { children: ["Count: ", count] }),
          jsx("p", { children: ["Doubled: ", doubledCount] }),
          jsx("div", {
            children: [
              decrementButton(count, { style: "margin-right: 10px;" }),
              incrementButton(count, { style: "margin-right: 10px;" }),
              setButton(count, 0, { children: "Reset" })
            ]
          })
        ]
      }),
      
      jsx("div", {
        style: "margin: 20px 0;",
        children: [
          jsx("h2", { children: "Visibility Toggle" }),
          jsx("div", {
            style: isVisible.get() ? "display: block;" : "display: none;",
            children: jsx("p", { 
              style: "background: lightblue; padding: 10px;",
              children: "This content can be toggled!" 
            })
          }),
          toggleButton(isVisible, { children: "Toggle Visibility" })
        ]
      }),
      
      jsx("div", {
        style: "margin: 20px 0;",
        children: [
          jsx("h2", { children: "Dynamic Greeting" }),
          jsx("p", { children: greeting }),
          jsx("input", {
            type: "text",
            value: name,
            placeholder: "Enter your name",
            style: "margin-right: 10px;"
          }),
          setButton(name, "Alice", { children: "Set to Alice" }),
          setButton(name, "Bob", { children: "Set to Bob", style: "margin-left: 5px;" })
        ]
      })
    ]
  });
  
  return withSignals(app);
}

export function simpleCounterExample(): Html {
  const count = signal(0);
  
  const counter = jsx("div", {
    style: "padding: 20px; font-family: Arial, sans-serif;",
    children: [
      jsx("h1", { children: "Simple Counter" }),
      jsx("p", { 
        style: "font-size: 24px; margin: 20px 0;",
        children: ["Current count: ", count] 
      }),
      jsx("div", {
        children: [
          decrementButton(count, { 
            style: "padding: 10px 20px; margin-right: 10px; font-size: 18px;" 
          }),
          incrementButton(count, { 
            style: "padding: 10px 20px; font-size: 18px;" 
          })
        ]
      })
    ]
  });
  
  return withSignals(counter);
}