import { allow } from '../allow';
import { isError } from '../utils';
import { ValidationError } from '../ValidationError';
import { Validator } from '../Validator';
import { wrap } from '../wrap';

/**
 * Check that the value is an {@link Array} via {@link Array#isArray}.
 */
export const is = <X>() => wrap(
  'array.is',
  allow<X, unknown[]>(
    (value) => Array.isArray(value),
    'value is not an array',
  ),
);

/**
 * Check that the array-based value is a homogenous array of items as validated
 * by the provided item-level validator. This validator may transform the array
 * into a different shape. The validator is run on all items before throwing a
 * {@link ValidatonError}. The {@link ValidationError#reason} filed will be set
 * with reasons for the items which failed validation. If the item-level validator
 * does not transform any values, then the original value is passed along.
 *
 * @param i the item-level validator
 */
export const items = <Y, X extends Y[], Z>(i: Validator<Y, Z>) => wrap<X, Z[]>('array.items', (value) => {
  if (!value) {
    return value;
  }

  let output: Z[] | null = null;
  let reasons: ValidationError[] | null = null;

  for (let index = 0; index < value.length; index += 1) {
    try {
      const item = value[index];
      const transformed = i(item);

      if ((transformed as unknown) !== (item as unknown) && !output) {
        output = new Array(value.length);

        for (let j = 0; j < index; j += 1) {
          output[j] = value[j] as any;
        }
      }

      if (output) {
        output[index] = transformed;
      }
    } catch (error) {
      // eslint-disable-next-line no-loop-func
      isError(error, ValidationError, () => {
        if (!reasons) {
          reasons = new Array(value.length);
        }

        reasons[index] = error;
      });
    }
  }

  if (reasons) {
    throw new ValidationError(
      'value is an array of invalid items',
      value,
      reasons,
    );
  }

  if (output) {
    return output;
  }

  return value as any;
});

/**
 * Check that the array-based value has length of at least `m`.
 */
export const min = <Y, X extends Y[], N extends number>(m: N) => wrap(
  'array.min',
  allow<X, X>(
    (value) => value.length >= m,
    `value.length is smaller than ${m}`,
  ),
);

/**
 * Check that the array-based value has length of at most `max`.
 */
export const max = <Y, X extends Y[], N extends number>(m: N) => wrap(
  'array.max',
  allow<X, X>(
    (value) => value.length <= m,
    `value.length is greater than ${m}`,
  ),
);

/**
 * Check that the array-based value has length in the closed range of `[start, end]`.
 */
export const length = <
  Y,
  X extends Array<Y>,
  L extends number,
  H extends number
>(
    start: L,
    end: H,
  ) => wrap(
    'array.length',
    allow<X, X>(
      (value) => value.length >= start && value.length <= end,
      `value.length is out of bounds [${start}, ${end}]`,
    ),
  );
