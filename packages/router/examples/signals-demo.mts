import { jsx } from "../src/runtime/jsx-runtime.mts";
import { 
  signal, 
  computed, 
  serializeSignals,
  SignalText, 
  SignalButton, 
  SignalInput, 
  SignalConditional,
  SignalList,
  createSignalScript
} from "../src/signals/index.mts";

function Counter() {
  const count = signal(0);
  const doubleCount = computed(() => count.value * 2);
  const isEven = computed(() => count.value % 2 === 0);
  
  return jsx("div", {
    class: "counter-demo",
    children: [
      jsx("h2", { children: "Counter Demo" }),
      
      jsx("div", { 
        class: "counter-display",
        children: [
          jsx("p", { children: ["Count: ", SignalText({ signal: count })] }),
          jsx("p", { children: ["Double: ", SignalText({ signal: doubleCount })] }),
          jsx("p", { children: ["Is Even: ", SignalText({ 
            signal: isEven, 
            transform: (val) => val ? "Yes" : "No" 
          })] })
        ]
      }),
      
      jsx("div", {
        class: "counter-controls",
        children: [
          SignalButton({
            signal: count,
            onClick: (current) => current + 1,
            children: "Increment"
          }),
          SignalButton({
            signal: count,
            onClick: (current) => current - 1,
            children: "Decrement"
          }),
          SignalButton({
            signal: count,
            onClick: () => 0,
            children: "Reset"
          })
        ]
      }),
      
      SignalConditional({
        signal: count,
        condition: (val) => val > 5,
        children: jsx("div", { 
          class: "warning",
          children: "Count is getting high!" 
        })
      })
    ]
  });
}

function TodoApp() {
  const todos = signal([
    { id: 1, text: "Learn signals", completed: false },
    { id: 2, text: "Build something cool", completed: false }
  ]);
  const newTodoText = signal("");
  const filter = signal("all");
  
  const filteredTodos = computed(() => {
    const allTodos = todos.value;
    const currentFilter = filter.value;
    
    if (currentFilter === "completed") {
      return allTodos.filter(todo => todo.completed);
    }
    if (currentFilter === "active") {
      return allTodos.filter(todo => !todo.completed);
    }
    return allTodos;
  });
  
  const addTodo = () => {
    const text = newTodoText.value.trim();
    if (text) {
      const newTodo = {
        id: Date.now(),
        text,
        completed: false
      };
      todos.set([...todos.value, newTodo]);
      newTodoText.set("");
    }
  };
  
  return jsx("div", {
    class: "todo-app",
    children: [
      jsx("h2", { children: "Todo App" }),
      
      jsx("div", {
        class: "todo-input",
        children: [
          SignalInput({
            signal: newTodoText,
            placeholder: "What needs to be done?",
            type: "text"
          }),
          jsx("button", {
            children: "Add Todo",
            "data-fx-click": `
              const text = signals.get('${newTodoText.id}').trim();
              if (text) {
                const todos = signals.get('${todos.id}');
                const newTodo = {
                  id: Date.now(),
                  text,
                  completed: false
                };
                signals.update('${todos.id}', [...todos, newTodo]);
                signals.update('${newTodoText.id}', '');
              }
            `
          })
        ]
      }),
      
      jsx("div", {
        class: "todo-filters",
        children: [
          SignalButton({
            signal: filter,
            onClick: () => "all",
            children: "All"
          }),
          SignalButton({
            signal: filter,
            onClick: () => "active",
            children: "Active"
          }),
          SignalButton({
            signal: filter,
            onClick: () => "completed",
            children: "Completed"
          })
        ]
      }),
      
      SignalList({
        signal: filteredTodos,
        renderItem: (todo) => jsx("div", {
          class: "todo-item",
          children: [
            jsx("input", {
              type: "checkbox",
              checked: todo.completed,
              "data-fx-click": `
                const todos = signals.get('${todos.id}');
                const updated = todos.map(t => 
                  t.id === ${todo.id} ? {...t, completed: !t.completed} : t
                );
                signals.update('${todos.id}', updated);
              `
            }),
            jsx("span", { 
              class: todo.completed ? "completed" : "",
              children: todo.text 
            }),
            jsx("button", {
              children: "Delete",
              "data-fx-click": `
                const todos = signals.get('${todos.id}');
                const filtered = todos.filter(t => t.id !== ${todo.id});
                signals.update('${todos.id}', filtered);
              `
            })
          ]
        }),
        keyFn: (todo) => String(todo.id)
      })
    ]
  });
}

function InputDemo() {
  const name = signal("");
  const age = signal(0);
  const email = signal("");
  
  return jsx("div", {
    class: "input-demo",
    children: [
      jsx("h2", { children: "Input Demo" }),
      
      jsx("div", {
        class: "form-group",
        children: [
          jsx("label", { children: "Name:" }),
          SignalInput({
            signal: name,
            type: "text",
            placeholder: "Enter your name"
          }),
          jsx("p", { children: ["Hello, ", SignalText({ signal: name }), "!"] })
        ]
      }),
      
      jsx("div", {
        class: "form-group",
        children: [
          jsx("label", { children: "Age:" }),
          SignalInput({
            signal: age,
            type: "number",
            placeholder: "Enter your age"
          }),
          jsx("p", { children: ["You are ", SignalText({ signal: age }), " years old"] })
        ]
      }),
      
      jsx("div", {
        class: "form-group",
        children: [
          jsx("label", { children: "Email:" }),
          SignalInput({
            signal: email,
            type: "email",
            placeholder: "Enter your email"
          }),
          jsx("p", { children: ["Email: ", SignalText({ signal: email })] })
        ]
      }),
      
      SignalConditional({
        signal: name,
        condition: (val) => val.length > 2,
        children: jsx("div", {
          class: "summary",
          children: [
            jsx("h3", { children: "Summary" }),
            jsx("p", { children: ["Name: ", SignalText({ signal: name })] }),
            jsx("p", { children: ["Age: ", SignalText({ signal: age })] }),
            jsx("p", { children: ["Email: ", SignalText({ signal: email })] })
          ]
        })
      })
    ]
  });
}

function App() {
  const serializedState = serializeSignals();
  
  return jsx("html", {
    children: [
      jsx("head", {
        children: [
          jsx("title", { children: "FX Router Signals Demo" }),
          jsx("style", {
            children: `
              body { font-family: Arial, sans-serif; margin: 20px; }
              .demo-section { margin: 20px 0; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
              .counter-display p, .form-group { margin: 10px 0; }
              .counter-controls button, .todo-filters button { margin: 5px; padding: 8px 16px; }
              .todo-item { display: flex; align-items: center; gap: 10px; margin: 5px 0; }
              .completed { text-decoration: line-through; opacity: 0.6; }
              .form-group label { display: block; font-weight: bold; }
              .form-group input { margin: 5px 0; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
              .warning { color: red; font-weight: bold; }
              .summary { background: #f0f0f0; padding: 15px; border-radius: 4px; margin-top: 20px; }
            `
          })
        ]
      }),
      jsx("body", {
        children: [
          jsx("h1", { children: "FX Router Signals Demo" }),
          
          jsx("div", {
            class: "demo-section",
            children: Counter()
          }),
          
          jsx("div", {
            class: "demo-section", 
            children: InputDemo()
          }),
          
          jsx("div", {
            class: "demo-section",
            children: TodoApp()
          }),
          
          createSignalScript(serializedState)
        ]
      })
    ]
  });
}

export { App };