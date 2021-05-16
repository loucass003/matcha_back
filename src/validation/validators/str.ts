import { allow } from '../allow';
import { transform } from '../transform';
import { ValidationError } from '../ValidationError';
import { wrap } from '../wrap';

/**
 * Check that the value is of the `string` type. It accepts empty strings as well.
 */
export const is = <X>() => wrap(
  'str.is',
  allow<X, string>(
    (value) => typeof value === 'string',
    'value is not string',
  ),
);

/**
 * Check that the value is of the `string` type and non-empty.
 */
export const nonempty = <X>() => wrap(
  'str.nonempty',
  allow<X, string>(
    (value) => typeof value === 'string' && !!value,
    'value is not a non-empty string',
  ),
);

/**
 * Check tha the string-based value has length at least `min`.
 */
export const min = <X extends string, N extends number>(m: N) => wrap(
  'str.min',
  allow<X, string>(
    (value) => value.length >= m,
    `value.length is lower than ${m}`,
  ),
);

/**
 * Check that the string-based value has length at most `max`.
 */
export const max = <X extends string, N extends number>(m: N) => wrap(
  'str.max',
  allow<X, string>(
    (value) => value.length <= m,
    `value.length is greater than ${m}`,
  ),
);

/**
 * Check that the string-based value has length in the closed range of `[start, end]`.
 */
export const length = <X extends string, L extends number, H extends number>(
  start: L,
  end: H,
) => wrap(
    'str.length',
    allow<X, string>(
      (value) => value.length >= start && value.length <= end,
      `value.length is out of bounds [${start}, ${end}]`,
    ),
  );

/**
 * Check that the string-based value matches a regular expression pattern. Optionally,
 * it may do a replacement (like {@link String#replace}) based on that pattern.
 *
 * If the pattern does not match, the replacement is not carried out.
 *
 * @param pattern the pattern to match and optionally replace
 * @param replace the optional replacement string for the matching pattern
 */
export const regex = <X extends string>(pattern: RegExp, replace?: string) => wrap(
  'str.regex',
  transform<X, string>((value) => {
    if (replace) {
      if (!value.match(pattern)) {
        throw new ValidationError(`value does not match ${pattern}`, value);
      }

      return value.replace(pattern, replace);
    }

    if (!value.match(pattern)) {
      throw new ValidationError(`value does not match ${pattern}`, value);
    }

    return value;
  }),
);
