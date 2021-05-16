import { ValidationError } from '../ValidationError';
import { Validator } from '../Validator';
import { wrap } from '../wrap';

/**
 * A generic validator checking for non-null and non-undefined values. Usually the start
 * of a validation chain.
 */
export const required = (): Validator<unknown, unknown> => wrap<unknown, unknown>('required', (value) => {
  if (undefined === value || value === null) {
    throw new ValidationError('value is null or undefined', value);
  }

  return value;
});
