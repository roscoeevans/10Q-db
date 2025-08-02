import { useEffect, useCallback } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface UseKeyboardOptions {
  target?: EventTarget | null;
  event?: 'keydown' | 'keyup' | 'keypress';
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export function useKeyboard(
  key: string | string[],
  handler: KeyHandler,
  options: UseKeyboardOptions = {}
): void {
  const {
    target = typeof window !== 'undefined' ? window : null,
    event = 'keydown',
    preventDefault = false,
    stopPropagation = false,
  } = options;

  const keys = Array.isArray(key) ? key : [key];

  const handleKeyEvent = useCallback(
    (event: KeyboardEvent) => {
      const isTargetKey = keys.some(k => {
        if (k === 'Escape') return event.key === 'Escape';
        if (k === 'Enter') return event.key === 'Enter';
        if (k === 'Tab') return event.key === 'Tab';
        if (k === 'Space') return event.key === ' ';
        if (k === 'ArrowUp') return event.key === 'ArrowUp';
        if (k === 'ArrowDown') return event.key === 'ArrowDown';
        if (k === 'ArrowLeft') return event.key === 'ArrowLeft';
        if (k === 'ArrowRight') return event.key === 'ArrowRight';
        if (k === 'Backspace') return event.key === 'Backspace';
        if (k === 'Delete') return event.key === 'Delete';
        if (k === 'Home') return event.key === 'Home';
        if (k === 'End') return event.key === 'End';
        if (k === 'PageUp') return event.key === 'PageUp';
        if (k === 'PageDown') return event.key === 'PageDown';
        
        // Handle modifier keys
        if (k.includes('+')) {
          const [modifier, keyName] = k.split('+');
          const hasModifier = modifier === 'Ctrl' ? event.ctrlKey :
                            modifier === 'Shift' ? event.shiftKey :
                            modifier === 'Alt' ? event.altKey :
                            modifier === 'Meta' ? event.metaKey : false;
          return hasModifier && event.key.toLowerCase() === keyName.toLowerCase();
        }
        
        // Handle single keys
        return event.key.toLowerCase() === k.toLowerCase();
      });

      if (isTargetKey) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        handler(event);
      }
    },
    [keys, handler, preventDefault, stopPropagation]
  );

  useEffect(() => {
    if (!target) return;

    target.addEventListener(event, handleKeyEvent as EventListener);

    return () => {
      target.removeEventListener(event, handleKeyEvent as EventListener);
    };
  }, [target, event, handleKeyEvent]);
}

// Convenience hooks for common keyboard patterns
export function useEscapeKey(handler: KeyHandler, options?: Omit<UseKeyboardOptions, 'key'>): void {
  useKeyboard('Escape', handler, options);
}

export function useEnterKey(handler: KeyHandler, options?: Omit<UseKeyboardOptions, 'key'>): void {
  useKeyboard('Enter', handler, options);
}

export function useArrowKeys(handler: KeyHandler, options?: Omit<UseKeyboardOptions, 'key'>): void {
  useKeyboard(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'], handler, options);
}

export function useCtrlKey(key: string, handler: KeyHandler, options?: Omit<UseKeyboardOptions, 'key'>): void {
  useKeyboard(`Ctrl+${key}`, handler, options);
} 