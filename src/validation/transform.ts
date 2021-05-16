import { TransferNullability } from './types';

/**
 * Wraps a transformation function as a function ready-to-use in {@link #wrap}.
 *
 * Some validator functions generally work on transforming a value to a different representation
 * (string as number) or modify it slightly (lowercased string, integer number).
 * These functions don't throw {@link ValdationError} although in some occasions this may be
 * necessary.
 *
 * @param transformer the transformation function
 *
 * @return function a function ready to use in {@link #wrap}
 */
export function transform<I, X>(transformer: (value: I) => X) {
  return (value: I): TransferNullability<I, X> => {
    if (value === null || undefined === value) {
      return value as any;
    }

    return transformer(value) as any;
  };
}
