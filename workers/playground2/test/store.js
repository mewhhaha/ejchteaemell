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
  // Check for child comment nodes
  const childNodes = Array.from(node.childNodes);
  for (const child of childNodes) {
    if (child.nodeType === Node.COMMENT_NODE) {
      const commentText = child.textContent.trim();

      const innerHTMLMatch = commentText.match(/innerHTML="(.+)";/);
      if (innerHTMLMatch) {
        const [, content] = innerHTMLMatch;
        try {
          const parsed = JSON.parse(content);
          handleEffectDirective(node, parsed.effect, parsed.dependencies);
        } catch (e) {
          console.warn("Failed to parse innerHTML directive:", e);
        }
        child.remove();
        continue;
      }

      const eventMatch = commentText.match(/^(\w+)="(.+)"$/);
      if (eventMatch) {
        const [, directive, encodedContent] = eventMatch;

        try {
          const content = decodeURIComponent(encodedContent);
          const parsed = JSON.parse(content);

          if (directive.startsWith("on")) {
            handleEventDirective(node, directive, parsed);
          } else {
            handleAttributeDirective(node, directive, parsed);
          }
        } catch (e) {
          console.warn("Failed to parse directive content:", encodedContent, e);
        }

        child.remove();
        continue;
      }
    }
  }

  // Also check previous siblings (for comments outside the element)
  let currentNode = node;
  while (currentNode.previousSibling) {
    const prevSibling = currentNode.previousSibling;

    if (prevSibling.nodeType === Node.COMMENT_NODE) {
      const commentText = prevSibling.textContent.trim();

      const eventMatch = commentText.match(/^(\w+)="(.+)"$/);
      if (eventMatch) {
        const [, directive, encodedContent] = eventMatch;

        try {
          const content = decodeURIComponent(encodedContent);
          const parsed = JSON.parse(content);

          if (directive.startsWith("on")) {
            handleEventDirective(node, directive, parsed);
          } else {
            handleAttributeDirective(node, directive, parsed);
          }
        } catch (e) {
          console.warn(
            "Failed to parse sibling directive content:",
            encodedContent,
            e,
          );
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
    // Resolve dependencies from the client state
    const resolvedDeps = resolveDependencies(dependencies);

    // Call the original function with resolved dependencies as 'this'
    fn.call(resolvedDeps, event);
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
    // Resolve dependencies from the client state
    const resolvedDeps = resolveDependencies(dependencies);

    // Call the original function with resolved dependencies as 'this'
    const value = fn.call(resolvedDeps);

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
    // Resolve dependencies from the client state
    const resolvedDeps = resolveDependencies(dependencies);

    // Call the original function with resolved dependencies as 'this'
    const result = fn.call(resolvedDeps);

    if (result != null) {
      node.textContent = String(result);
    }
  });
}

function getFunction(hash) {
  const fn = window.dynamicAssets?.get(hash);
  return fn || null;
}

function resolveDependencies(deps) {
  if (!deps) return {};

  const resolved = {};
  for (const [key, value] of Object.entries(deps)) {
    if (value && typeof value === "object" && value.__isSignal) {
      const signal = window.__store.get(value);
      resolved[key] = signal; // Keep the signal object, not just its value
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
