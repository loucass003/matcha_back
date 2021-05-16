import { allow } from '../allow';
import { transform } from '../transform';
import { wrap } from '../wrap';

/**
 * Check that the value is a boolean. (Does not allow non-boolean values!)
 *
 * @see #truthy
 * @see #falsy
 */
export const is = <X>() => wrap(
  'bool.is',
  allow<X, boolean>(
    (value) => typeof value === 'boolean',
    'value is not a boolean',
  ),
);

/**
 * Check that the value is strictly `true`.
 */
export const truth = () => wrap(
  'bool.truth',
  allow<unknown, true>((value) => value === true, 'value is not true'),
);

/**
 * Check that the value is strictly `false`.
 */
export const falseness = () => wrap(
  'bool.falseness',
  allow<unknown, false>((value) => value === false, 'value is not false'),
);

/**
 * Transform any value into its truthy boolean equivalent.
 */
export const truthy = <X>() => wrap(
  'bool.truthy',
  transform<X, boolean>((value) => !!value),
);

/**
 * Transform any value into its falsy boolean equivalent.
 */
export const falsy = <X>() => wrap(
  'bool.falsy',
  transform<X, boolean>((value) => !value),
);
