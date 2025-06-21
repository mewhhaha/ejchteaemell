import { jsx } from "./src/runtime/jsx-signals.mts";
import { signal, computed } from "./src/signals.mts";
import { ClientSignals } from "./src/client-signals.mts";
import { Counter, Toggle, TextInput } from "./src/signal-components.mts";
import type { Html } from "./src/runtime/node.mts";

// Example: Simple reactive app
export function SignalsExample(): Html {
  // Create signals
  const name = signal("World");
  const count = signal(0);
  const isVisible = signal(true);
  
  // Computed signal (derives from other signals)
  const greeting = computed(() => `Hello, ${name()}!`);
  const doubleCount = computed(() => count() * 2);

  return jsx("html", {
    children: [
      jsx("head", {
        children: [
          jsx("title", { children: "Signals Example" }),
          jsx("style", {
            children: `
              body { font-family: Arial, sans-serif; padding: 20px; }
              .container { max-width: 800px; margin: 0 auto; }
              .section { margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; }
              h1, h2 { color: #333; }
            `,
          }),
        ],
      }),
      jsx("body", {
        children: [
          jsx("div", {
            class: "container",
            children: [
              jsx("h1", { children: "🚀 Signals & State Management Demo" }),

              // Basic signal display
              jsx("div", {
                class: "section",
                children: [
                  jsx("h2", { children: "1. Basic Signal Display" }),
                  jsx("p", {
                    children: [
                      "Greeting: ",
                      jsx("strong", { 
                        "data-signal-id": greeting.id,
                        children: greeting() 
                      }),
                    ],
                  }),
                  jsx("p", {
                    children: [
                      "Name: ",
                      jsx("input", {
                        type: "text",
                        value: name(),
                        "data-signal-id": name.id,
                        "data-type": "text",
                        style: "padding: 4px 8px; margin-left: 8px;",
                      }),
                    ],
                  }),
                ],
              }),

              // Counter component
              jsx("div", {
                class: "section",
                children: [
                  jsx("h2", { children: "2. Counter Component" }),
                  jsx("p", { children: "A reusable counter with increment/decrement buttons:" }),
                  Counter({ initialValue: 0 }),
                  jsx("p", {
                    style: "margin-top: 10px;",
                    children: [
                      "Double count: ",
                      jsx("strong", { 
                        "data-signal-id": doubleCount.id,
                        children: doubleCount() 
                      }),
                    ],
                  }),
                ],
              }),

              // Toggle component
              jsx("div", {
                class: "section",
                children: [
                  jsx("h2", { children: "3. Toggle Component" }),
                  jsx("p", { children: "Toggle between states:" }),
                  Toggle({ 
                    initialValue: true,
                    trueText: "Visible",
                    falseText: "Hidden" 
                  }),
                  jsx("div", {
                    "data-signal-id": isVisible.id,
                    style: isVisible() ? "display: block; margin-top: 10px; padding: 10px; background: #e8f5e8; border-radius: 4px;" : "display: none;",
                    children: "🎉 This content is conditionally visible!",
                  }),
                ],
              }),

              // Text input component
              jsx("div", {
                class: "section",
                children: [
                  jsx("h2", { children: "4. Text Input Component" }),
                  jsx("p", { children: "Real-time text input binding:" }),
                  TextInput({
                    label: "Enter your message:",
                    initialValue: "Type something...",
                    placeholder: "Start typing...",
                  }),
                ],
              }),

              // Manual signal buttons
              jsx("div", {
                class: "section",
                children: [
                  jsx("h2", { children: "5. Manual Signal Control" }),
                  jsx("p", { children: "Direct signal manipulation:" }),
                  jsx("div", {
                    style: "display: flex; gap: 10px; margin: 10px 0;",
                    children: [
                      jsx("signal-button", {
                        "data-signal-id": count.id,
                        "data-action": "set",
                        "data-value": "0",
                        style: "padding: 8px 16px; background: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer;",
                        children: "Reset Count",
                      }),
                      jsx("signal-button", {
                        "data-signal-id": name.id,
                        "data-action": "set",
                        "data-value": JSON.stringify("Signals"),
                        style: "padding: 8px 16px; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer;",
                        children: "Set Name to 'Signals'",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Include client-side signals script
          ClientSignals({ nonce: undefined }),
        ],
      }),
    ],
  });
}

// Example: Todo List with signals
export function TodoExample(): Html {
  const todos = signal<Array<{ id: string; text: string; completed: boolean }>>([]);
  const newTodoText = signal("");
  const filter = signal<"all" | "active" | "completed">("all");

  const filteredTodos = computed(() => {
    const allTodos = todos();
    switch (filter()) {
      case "active":
        return allTodos.filter(todo => !todo.completed);
      case "completed":
        return allTodos.filter(todo => todo.completed);
      default:
        return allTodos;
    }
  });

  return jsx("html", {
    children: [
      jsx("head", {
        children: [
          jsx("title", { children: "Todo App with Signals" }),
          jsx("style", {
            children: `
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
              .todo-input { display: flex; gap: 10px; margin-bottom: 20px; }
              .todo-input input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
              .todo-input button { padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
              .todo-item { display: flex; align-items: center; gap: 10px; padding: 8px; border-bottom: 1px solid #eee; }
              .todo-item input[type="checkbox"] { margin-right: 8px; }
              .todo-item.completed { opacity: 0.6; text-decoration: line-through; }
              .filters { display: flex; gap: 10px; margin-bottom: 20px; }
              .filter-btn { padding: 4px 8px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; }
              .filter-btn.active { background: #007bff; color: white; }
            `,
          }),
        ],
      }),
      jsx("body", {
        children: [
          jsx("h1", { children: "📝 Todo App with Signals" }),
          
          jsx("div", {
            class: "todo-input",
            children: [
              jsx("signal-input", {
                "data-signal-id": newTodoText.id,
                "data-type": "text",
                children: jsx("input", {
                  type: "text",
                  placeholder: "Add a new todo...",
                  value: newTodoText(),
                }),
              }),
              jsx("signal-button", {
                "data-signal-id": todos.id,
                "data-action": "set",
                "data-value": JSON.stringify([
                  ...todos(),
                  { 
                    id: crypto.randomUUID(), 
                    text: newTodoText(), 
                    completed: false 
                  }
                ]),
                children: "Add Todo",
              }),
            ],
          }),

          jsx("div", {
            class: "filters",
            children: [
              jsx("signal-button", {
                "data-signal-id": filter.id,
                "data-action": "set",
                "data-value": JSON.stringify("all"),
                class: filter() === "all" ? "filter-btn active" : "filter-btn",
                children: "All",
              }),
              jsx("signal-button", {
                "data-signal-id": filter.id,
                "data-action": "set",
                "data-value": JSON.stringify("active"),
                class: filter() === "active" ? "filter-btn active" : "filter-btn",
                children: "Active",
              }),
              jsx("signal-button", {
                "data-signal-id": filter.id,
                "data-action": "set",
                "data-value": JSON.stringify("completed"),
                class: filter() === "completed" ? "filter-btn active" : "filter-btn",
                children: "Completed",
              }),
            ],
          }),

          jsx("div", {
            "data-signal-id": filteredTodos.id,
            children: filteredTodos().map(todo =>
              jsx("div", {
                class: todo.completed ? "todo-item completed" : "todo-item",
                key: todo.id,
                children: [
                  jsx("input", {
                    type: "checkbox",
                    checked: todo.completed,
                  }),
                  jsx("span", { children: todo.text }),
                ],
              })
            ),
          }),

          ClientSignals({ nonce: undefined }),
        ],
      }),
    ],
  });
}