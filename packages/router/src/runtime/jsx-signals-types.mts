import type { JSX as BaseJSX } from "./jsx.mts";

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
    }
  }
}

export type { JSX } from "./jsx.mts";