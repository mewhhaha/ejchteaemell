import type { JSX as BaseJSX } from "./jsx.mts";
import type { SerializableFunction } from "../function-serializer.mts";

declare global {
  namespace JSX {
    interface IntrinsicElements extends BaseJSX.IntrinsicElements {
      'signal-button': {
        children?: any;
        'data-signal-id'?: string;
        'data-action'?: 'increment' | 'decrement' | 'toggle' | 'set';
        'data-value'?: string;
        className?: string;
        style?: string;
        [key: string]: any;
      };
      'signal-input': {
        children?: any;
        'data-signal-id'?: string;
        'data-type'?: 'text' | 'number' | 'boolean';
        className?: string;
        style?: string;
        [key: string]: any;
      };
      'signal-element': {
        children?: any;
        'data-signal-id'?: string;
        'data-signals'?: string;
        className?: string;
        style?: string;
        [key: string]: any;
      };
      // Override event handlers to accept SerializableFunction
      button: BaseJSX.IntrinsicElements['button'] & {
        onClick?: string | SerializableFunction;
        onInput?: string | SerializableFunction;
        onChange?: string | SerializableFunction;
      };
      input: BaseJSX.IntrinsicElements['input'] & {
        onClick?: string | SerializableFunction;
        onInput?: string | SerializableFunction;
        onChange?: string | SerializableFunction;
      };
      div: BaseJSX.IntrinsicElements['div'] & {
        onClick?: string | SerializableFunction;
        onInput?: string | SerializableFunction;
        onChange?: string | SerializableFunction;
      };
    }
  }
}

export type { JSX } from "./jsx.mts";