import { serializer } from "../runtime/serializer.mts";

interface ReactiveSignal<T> {
  id: string;
  value: T;
  _serialized: boolean;
  _serializationId?: string;
  _subscribers: Set<() => void>;
  serialize(): string;
  subscribe(callback: () => void): () => void;
  _isSignal: true;
}

export const useSignal = <T>(initialValue: T): ReactiveSignal<T> => {
  const signal: ReactiveSignal<T> = {
    id: crypto.randomUUID(),
    _value: initialValue,
    _serialized: false,
    _subscribers: new Set(),
    _isSignal: true,

    get value() {
      return this._value;
    },

    set value(newValue: T) {
      if (this._value !== newValue) {
        this._value = newValue;
        this._subscribers.forEach((callback) => callback());
      }
    },

    serialize() {
      if (!this._serialized) {
        this._serializationId = serializer.serializeState(this);
        this._serialized = true;
      }
      return this._serializationId!;
    },

    subscribe(callback: () => void) {
      this._subscribers.add(callback);
      return () => this._subscribers.delete(callback);
    },
  };

  return signal;
};

export const isSignal = (value: any): value is ReactiveSignal<any> => {
  return value && typeof value === "object" && value._isSignal === true;
};
