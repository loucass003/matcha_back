import { allow } from '../allow';
import { transform } from '../transform';
import { wrap } from '../wrap';

/**
   * Check that the value is a `number`. It does not allow `NaN` values.
   *
   * @see #isNaN
   */
export const is = <X>() => wrap(
  'num.is',
  allow<X, number>(
    (value) => typeof value === 'number' && !Number.isNaN(value),
    'value is not a number',
  ),
);

/**
   * Check that the value is a `number` including `NaN`.
   */
export const isNaN = <X>() => wrap(
  'num.isNaN',
  allow<X, number>((value) => typeof value === 'number', 'value is not a number type'),
);

/**
   * Check that the value is an integer.
   */
export const isInteger = <X>() => wrap(
  'num.isInteger',
  allow<X, number>(
    (value) => typeof value === 'number' && Number.isInteger(value),
    'value is not an integer',
  ),
);

/**
   * Transform a string-based value into a number via the {@link Number} function.
   * It will return `NaN` if unable to parse but you can pass in throwOnNaN as an option.
   */
export const parse = <X extends string>(
  options: { throwOnNaN: boolean } = { throwOnNaN: false },
  parser: (value: X) => number = Number,
) => {
  if (options && options.throwOnNaN) {
    return wrap('num.parse', transform<X, number>((value) => parser(value))).and(is());
  }
  return wrap('num.parse', transform<X, number>((value) => parser(value)));
};

/**
   * Check that the number-based value is at least `m`.
   */
export const min = <X extends number, N extends number>(m: N) => wrap('num.min', allow<X, number>((value: number) => value >= m, `value is less than ${m}`));

/**
   * Check that the number-based value is at most `m`.
   */
export const max = <X extends number, N extends number>(m: N) => wrap(
  'num.max',
  allow<X, number>((value: number) => value <= m, `value is greater than ${m}`),
);

/**
   * Transform a number-based value into an integer number via {@link Math#trunc}.
   */
export const integer = <X extends number>() => wrap('num.integer', transform<X, number>((value: number) => Math.trunc(value) as X));
