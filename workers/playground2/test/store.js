window.__signal = (() => {
  function signal(value) {
    return {
      get value() {
        track(this);
        return value;
      },

      set value(newValue) {
        value = newValue;
        execute(this);
      },
    };
  }

  const usages = new WeakMap();
  let currentEffect = null;

  function track(signal) {
    if (!usages.has(signal)) {
      usages.set(signal, []);
    }

    if (currentEffect) {
      usages.get(signal)?.push(currentEffect);
    }
  }

  function execute(signal) {
    usages.get(signal)?.forEach((callable) => callable());
  }

  function effect(callable) {
    currentEffect = callable;
    callable();
    currentEffect = null;
  }

  function computed(callable) {
    const result = signal(undefined);
    effect(() => {
      result.value = callable();
    });
    return result;
  }

  return {
    signal,
    effect,
    computed,
  };
})();

window.__store = (() => {
  const store = new Map();

  return {
    get: (ref) => {
      if (store.has(ref.id)) {
        return store.get(ref.id);
      }

      const s = window.__signal.signal(ref.value);
      store.set(ref.id, s);
      return s;
    },
  };
})();

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          processNodeDirectives(node);
        }
      });
    }
  });
});

function processNodeDirectives(node) {
  let currentNode = node;

  while (currentNode.previousSibling) {
    const prevSibling = currentNode.previousSibling;

    if (prevSibling.nodeType === Node.COMMENT_NODE) {
      const commentText = prevSibling.textContent.trim();

      const effectMatch = commentText.match(
        /effect="([^"]+)";\s*dependencies="([^"]+)";/,
      );
      if (effectMatch) {
        const [, effectHash, encodedDeps] = effectMatch;
        try {
          const dependencies = JSON.parse(decodeURIComponent(encodedDeps));
          handleEffectDirective(node, effectHash, dependencies);
        } catch (e) {
          console.warn("Failed to parse effect directive:", e);
        }
        prevSibling.remove();
        break;
      }

      const eventMatch = commentText.match(/^(\w+)="(.+)"$/);
      if (eventMatch) {
        const [, directive, content] = eventMatch;

        try {
          const parsed = JSON.parse(content);

          if (directive.startsWith("on")) {
            handleEventDirective(node, directive, parsed);
          } else {
            handleAttributeDirective(node, directive, parsed);
          }
        } catch (e) {
          console.warn("Failed to parse directive content:", content, e);
        }

        prevSibling.remove();
        break;
      }
    } else if (prevSibling.nodeType === Node.ELEMENT_NODE) {
      break;
    }

    currentNode = prevSibling;
  }
}

function handleEventDirective(node, eventName, { handler, dependencies }) {
  const eventType = eventName.slice(2).toLowerCase();

  const fn = getFunction(handler);
  if (!fn) {
    console.warn("Handler function not found:", handler);
    return;
  }

  node.addEventListener(eventType, (event) => {
    const resolvedDeps = resolveDependencies(dependencies);
    fn(event, resolvedDeps);
  });
}

function handleAttributeDirective(
  node,
  attributeName,
  { handler, dependencies },
) {
  const fn = getFunction(handler);
  if (!fn) {
    console.warn("Attribute function not found:", handler);
    return;
  }

  window.__signal.effect(() => {
    const resolvedDeps = resolveDependencies(dependencies);
    const value = fn(resolvedDeps);

    if (value != null) {
      if (typeof value === "boolean") {
        if (value) {
          node.setAttribute(attributeName, "");
        } else {
          node.removeAttribute(attributeName);
        }
      } else {
        node.setAttribute(attributeName, String(value));
      }
    }
  });
}

function handleEffectDirective(node, effectHash, dependencies) {
  const fn = getFunction(effectHash);
  if (!fn) {
    console.warn("Effect function not found:", effectHash);
    return;
  }

  window.__signal.effect(() => {
    const resolvedDeps = resolveDependencies(dependencies);
    const result = fn(resolvedDeps);

    if (result != null) {
      node.textContent = String(result);
    }
  });
}

function getFunction(hash) {
  const serialized = window.dynamicAssets?.get(hash);
  if (!serialized) return null;

  try {
    return new Function("return " + serialized)();
  } catch (e) {
    console.warn("Failed to deserialize function:", e);
    return null;
  }
}

function resolveDependencies(deps) {
  if (!deps) return {};

  const resolved = {};
  for (const [key, value] of Object.entries(deps)) {
    if (value && typeof value === "object" && value.__isSignal) {
      const signal = window.__store.get(value);
      resolved[key] = signal.value;
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}

function extractSignalsFromDeps(deps) {
  if (!deps) return [];

  const signals = [];
  for (const value of Object.values(deps)) {
    if (value && typeof value === "object" && value.__isSignal) {
      signals.push(window.__store.get(value));
    }
  }
  return signals;
}

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
