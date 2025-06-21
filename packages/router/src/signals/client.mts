type SignalId = string;

interface ClientSignal<T> {
  id: SignalId;
  value: T;
  listeners: Set<() => void>;
}

const clientSignals = new Map<SignalId, ClientSignal<any>>();
const elementBindings = new Map<Element, SignalId>();

export function initializeClientSignals(initialState: Record<SignalId, any>): void {
  Object.entries(initialState).forEach(([id, value]) => {
    clientSignals.set(id, {
      id,
      value,
      listeners: new Set()
    });
  });
}

export function updateSignal<T>(id: SignalId, newValue: T): void {
  const signal = clientSignals.get(id);
  if (!signal) return;
  
  if (signal.value !== newValue) {
    signal.value = newValue;
    signal.listeners.forEach(listener => listener());
    updateBoundElements(id, newValue);
  }
}

export function subscribeToSignal(id: SignalId, listener: () => void): () => void {
  const signal = clientSignals.get(id);
  if (!signal) return () => {};
  
  signal.listeners.add(listener);
  return () => signal.listeners.delete(listener);
}

export function getSignalValue(id: SignalId): any {
  return clientSignals.get(id)?.value;
}

export function bindElementToSignal(element: Element, signalId: SignalId): void {
  elementBindings.set(element, signalId);
  
  const signal = clientSignals.get(signalId);
  if (signal) {
    updateElementContent(element, signal.value);
  }
}

export function bindElementAttribute(element: Element, attribute: string, signalId: SignalId): void {
  const signal = clientSignals.get(signalId);
  if (signal) {
    element.setAttribute(attribute, String(signal.value));
  }
  
  subscribeToSignal(signalId, () => {
    const currentSignal = clientSignals.get(signalId);
    if (currentSignal) {
      element.setAttribute(attribute, String(currentSignal.value));
    }
  });
}

function updateBoundElements(signalId: SignalId, newValue: any): void {
  elementBindings.forEach((boundSignalId, element) => {
    if (boundSignalId === signalId) {
      updateElementContent(element, newValue);
    }
  });
}

function updateElementContent(element: Element, value: any): void {
  const safeValue = sanitizeValue(value);
  if (element.textContent !== safeValue) {
    element.textContent = safeValue;
  }
}

function sanitizeValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

export function handleClick(signalId: SignalId, updater: (current: any) => any): (event: Event) => void {
  return (event: Event) => {
    event.preventDefault();
    const signal = clientSignals.get(signalId);
    if (signal) {
      const newValue = updater(signal.value);
      updateSignal(signalId, newValue);
    }
  };
}

export function setupEventListeners(): void {
  document.addEventListener('click', (event) => {
    const target = event.target as Element;
    const clickHandler = target.getAttribute('data-fx-click');
    if (clickHandler) {
      try {
        const handler = new Function('event', 'signals', clickHandler);
        handler(event, {
          update: updateSignal,
          get: getSignalValue
        });
      } catch (error) {
        console.error('Error executing click handler:', error);
      }
    }
  });
}