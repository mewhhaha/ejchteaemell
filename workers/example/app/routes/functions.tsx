import { signal, computed } from "@mewhhaha/fx-router/signals";
import { AutoClient } from "@mewhhaha/fx-router/signals/complete";
import { withDeps } from "@mewhhaha/fx-router/signals/functions";

export default function FunctionSerializationDemo() {
  // Create signals
  const count = signal(0);
  const name = signal("World");
  const message = signal("Hello!");
  
  // Computed signal
  const greeting = computed(() => `${message()}, ${name()}!`);

  // This is the magic - these functions will be serialized automatically!
  const increment = () => count(count() + 1);
  const decrement = () => count(count() - 1);
  const reset = () => count(0);
  const updateMessage = (newMessage: string) => message(newMessage);
  
  return (
    <div class="min-h-screen p-8 bg-gray-50">
      <div class="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            🎯 Function Serialization Demo
          </h1>
          <p class="text-lg text-gray-600">
            Natural React-like onClick handlers that work with streaming HTML!
          </p>
        </div>

        {/* Natural Syntax Counter */}
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold mb-4 text-blue-600">Natural onClick Syntax</h2>
          <div class="text-center space-y-4">
            <div class="text-3xl font-bold p-4 bg-blue-50 rounded">
              Count: {count()}
            </div>
            <div class="flex gap-2 justify-center">
              {/* This is the natural syntax that now works! */}
              <button 
                onClick={withDeps(decrement, { count })}
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                -1
              </button>
              <button 
                onClick={withDeps(reset, { count })}
                class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={withDeps(increment, { count })}
                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                +1
              </button>
            </div>
          </div>
        </div>

        {/* Inline Functions */}
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold mb-4 text-purple-600">Inline Function Handlers</h2>
          <div class="space-y-4">
            <div class="text-center">
              <div class="text-2xl mb-4">Message: "{message()}"</div>
              <div class="flex gap-2 justify-center flex-wrap">
                <button 
                  onclick={withDeps(() => message("Hello"), { message })}
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Say Hello
                </button>
                <button 
                  onclick={withDeps(() => message("Goodbye"), { message })}
                  class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Say Goodbye
                </button>
                <button 
                  onclick={withDeps(() => message("Welcome"), { message })}
                  class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Say Welcome
                </button>
                <button 
                  onclick={withDeps(() => message("🎉 Party!"), { message })}
                  class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                >
                  Party!
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Text Input with Functions */}
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold mb-4 text-green-600">Interactive Input</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Your Name:
              </label>
              <input
                type="text"
                value={name()}
                oninput={withDeps((e: Event) => {
                  const target = e.target as HTMLInputElement;
                  name(target.value);
                }, { name })}
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your name..."
              />
            </div>
            <div class="p-4 bg-green-50 rounded text-center">
              <div class="text-lg font-semibold">{greeting()}</div>
            </div>
          </div>
        </div>

        {/* Complex State Updates */}
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold mb-4 text-indigo-600">Complex State Updates</h2>
          <div class="space-y-4">
            <div class="grid md:grid-cols-3 gap-4 text-center">
              <div class="p-4 bg-indigo-50 rounded">
                <div class="text-sm text-gray-600 mb-1">Count</div>
                <div class="text-2xl font-bold text-indigo-600">{count()}</div>
              </div>
              <div class="p-4 bg-blue-50 rounded">
                <div class="text-sm text-gray-600 mb-1">Double</div>
                <div class="text-2xl font-bold text-blue-600">{count() * 2}</div>
              </div>
              <div class="p-4 bg-green-50 rounded">
                <div class="text-sm text-gray-600 mb-1">Square</div>
                <div class="text-2xl font-bold text-green-600">{count() * count()}</div>
              </div>
            </div>
            
            <div class="flex gap-2 justify-center flex-wrap">
              <button 
                onclick={withDeps(() => {
                  const newValue = count() + 5;
                  count(newValue);
                  message(`Added 5! Now: ${newValue}`);
                }, { count, message })}
                class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              >
                +5 & Update Message
              </button>
              <button 
                onclick={withDeps(() => {
                  count(Math.floor(Math.random() * 100));
                  message("Random!");
                }, { count, message })}
                class="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
              >
                Random Value
              </button>
              <button 
                onclick={withDeps(() => {
                  if (count() < 10) {
                    count(count() * 2);
                    message("Doubled!");
                  } else {
                    count(Math.floor(count() / 2));
                    message("Halved!");
                  }
                }, { count, message })}
                class="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
              >
                Smart Toggle
              </button>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div class="bg-gray-800 text-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold mb-4 text-yellow-400">How Function Serialization Works</h2>
          <div class="space-y-3 text-sm">
            <div class="bg-gray-700 p-3 rounded">
              <strong class="text-yellow-400">1. Server-side:</strong> Functions are serialized to strings with their dependencies
            </div>
            <div class="bg-gray-700 p-3 rounded">
              <strong class="text-yellow-400">2. Client-side:</strong> Functions are recreated with the correct scope injected
            </div>
            <div class="bg-gray-700 p-3 rounded">
              <strong class="text-yellow-400">3. Signals:</strong> Signal references are replaced with client-side proxies
            </div>
            <div class="bg-gray-700 p-3 rounded">
              <strong class="text-yellow-400">4. Execution:</strong> Event handlers run with access to live signals and dependencies
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold mb-4 text-gray-800">Code Example</h2>
          <div class="bg-gray-100 p-4 rounded text-sm font-mono overflow-x-auto">
            <div class="text-gray-600 mb-2">// Define signals and handlers</div>
            <div>const count = signal(0);</div>
            <div>const increment = () => count(count() + 1);</div>
            <div class="mt-2 text-gray-600">// Use natural syntax with withDeps()</div>
            <div>&lt;button onclick={`{withDeps(increment, { count })}`}&gt;</div>
            <div class="ml-2">+1</div>
            <div>&lt;/button&gt;</div>
            <div class="mt-2 text-gray-600">// Or inline functions</div>
            <div>&lt;button onclick={`{withDeps(() => count(0), { count })}`}&gt;</div>
            <div class="ml-2">Reset</div>
            <div>&lt;/button&gt;</div>
          </div>
        </div>

        {/* Navigation */}
        <div class="text-center">
          <a 
            href="/signals" 
            class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-4"
          >
            ← Back to Signals Demo
          </a>
          <a 
            href="/products" 
            class="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Products
          </a>
        </div>
      </div>

      {/* Include the complete client script */}
      <AutoClient nonce={undefined} />
    </div>
  );
}