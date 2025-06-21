/// <reference types="@mewhhaha/fx-router/signals/jsx-types" />

import { signal, computed } from "@mewhhaha/fx-router/signals";
import { ClientSignals } from "@mewhhaha/fx-router/signals/client";

// Global signals for demonstration
const globalCount = signal(0);
const userName = signal("Anonymous");

export default function SignalsDemo() {
  return (
    <div class="min-h-screen p-8 bg-gray-50">
      <div class="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            🚀 Signals & State Demo
          </h1>
          <p class="text-lg text-gray-600">
            Interactive components with streaming HTML and client-side reactivity
          </p>
        </div>

        {/* Simple Counter Example */}
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold mb-4 text-blue-600">Simple Counter</h2>
          <div class="text-center space-y-4">
            <div class="text-3xl font-bold p-4 bg-blue-50 rounded">
              <span id="counter-display">0</span>
            </div>
            <div class="flex gap-2 justify-center">
              <button 
                id="decrement-btn"
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                -1
              </button>
              <button 
                id="reset-btn"
                class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
              <button 
                id="increment-btn"
                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                +1
              </button>
            </div>
          </div>
        </div>

        {/* Text Input Example */}
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold mb-4 text-purple-600">Text Input</h2>
          <div class="space-y-4">
            <input
              id="text-input"
              type="text"
              placeholder="Type something..."
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div class="p-4 bg-purple-50 rounded">
              <strong>You typed: </strong>
              <span id="text-display">Type something...</span>
            </div>
          </div>
        </div>

        {/* Multiple Elements Sharing State */}
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold mb-4 text-green-600">Shared State</h2>
          <p class="text-gray-600 mb-4">
            Both counters below share the same state. Changing one affects the other!
          </p>
          
          <div class="grid md:grid-cols-2 gap-6">
            <div class="p-4 border-2 border-blue-200 rounded-lg">
              <h3 class="font-medium text-blue-600 mb-2">Counter A</h3>
              <div class="text-center">
                <div class="text-2xl font-bold mb-2 shared-counter">0</div>
                <button 
                  class="shared-increment px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  +1 from A
                </button>
              </div>
            </div>
            
            <div class="p-4 border-2 border-green-200 rounded-lg">
              <h3 class="font-medium text-green-600 mb-2">Counter B</h3>
              <div class="text-center">
                <div class="text-2xl font-bold mb-2 shared-counter">0</div>
                <button 
                  class="shared-decrement px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  -1 from B
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold mb-4 text-indigo-600">Theme Toggle</h2>
          <div class="flex items-center justify-between">
            <div>
              <span class="text-lg">Current theme: </span>
              <span id="theme-display" class="font-semibold capitalize">light</span>
            </div>
            <button
              id="theme-toggle"
              class="px-6 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
            >
              Switch to Dark
            </button>
          </div>
          <div id="theme-box" class="mt-4 p-4 rounded transition-colors bg-gray-100 text-gray-900">
            This box changes color based on the theme!
          </div>
        </div>

        {/* How It Works */}
        <div class="bg-gray-800 text-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold mb-4 text-yellow-400">How This Would Work with Signals</h2>
          <div class="space-y-3 text-sm">
            <p>
              <strong class="text-yellow-400">1. Server-side:</strong> Signals would render their current values during HTML streaming
            </p>
            <p>
              <strong class="text-yellow-400">2. Client-side:</strong> Custom elements would track signal IDs and update DOM when signals change
            </p>
            <p>
              <strong class="text-yellow-400">3. Reactivity:</strong> All elements with matching signal IDs would update automatically
            </p>
            <p>
              <strong class="text-yellow-400">4. This demo:</strong> Uses vanilla JavaScript to simulate the concept
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div class="text-center">
          <a 
            href="/products" 
            class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Products
          </a>
        </div>
      </div>

      {/* Client-side JavaScript to simulate signals behavior */}
      <script>{`
(function() {
  // Simple state management
  let counter = 0;
  let sharedCounter = 0;
  let message = "Type something...";
  let theme = "light";

  // Update functions
  function updateCounter() {
    document.getElementById('counter-display').textContent = counter;
  }

  function updateSharedCounters() {
    document.querySelectorAll('.shared-counter').forEach(el => {
      el.textContent = sharedCounter;
    });
  }

  function updateMessage() {
    document.getElementById('text-display').textContent = message;
  }

  function updateTheme() {
    const display = document.getElementById('theme-display');
    const button = document.getElementById('theme-toggle');
    const box = document.getElementById('theme-box');
    
    display.textContent = theme;
    button.textContent = 'Switch to ' + (theme === 'light' ? 'Dark' : 'Light');
    
    if (theme === 'dark') {
      box.className = 'mt-4 p-4 rounded transition-colors bg-gray-800 text-white';
    } else {
      box.className = 'mt-4 p-4 rounded transition-colors bg-gray-100 text-gray-900';
    }
  }

  // Event listeners
  document.getElementById('increment-btn').addEventListener('click', () => {
    counter++;
    updateCounter();
  });

  document.getElementById('decrement-btn').addEventListener('click', () => {
    counter--;
    updateCounter();
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    counter = 0;
    updateCounter();
  });

  document.getElementById('text-input').addEventListener('input', (e) => {
    message = e.target.value || "Type something...";
    updateMessage();
  });

  document.querySelectorAll('.shared-increment').forEach(btn => {
    btn.addEventListener('click', () => {
      sharedCounter++;
      updateSharedCounters();
    });
  });

  document.querySelectorAll('.shared-decrement').forEach(btn => {
    btn.addEventListener('click', () => {
      sharedCounter--;
      updateSharedCounters();
    });
  });

  document.getElementById('theme-toggle').addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    updateTheme();
  });

  // Initialize
  updateCounter();
  updateSharedCounters();
  updateMessage();
  updateTheme();
})();
      `}</script>
    </div>
  );
}