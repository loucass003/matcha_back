import { allow } from '../allow';
import { transform } from '../transform';
import { isError } from '../utils';
import { ValidationError } from '../ValidationError';
import { Validator } from '../Validator';
import { wrap } from '../wrap';

/**
 * Checks that the value is a JavaScript object excluding `null`.
 * Usually when validating HTTP body input you want to use toi.obj.isplain() as that
 * can mitigate some prototype-pollution attacks.
 */
export const is = <X>() => wrap(
  'obj.is',
  allow<X, Record<string, unknown>>(
    (value) => value !== null && typeof value === 'object',
    'value is not an object type',
  ),
);

/**
 * Checks that the object is a plain JavaScript object, i.e. an object whose
 * prototype is Object.prototype and no attempt has been made to insert a
 * __proto__ property as a way to change the object's prototype. `null` is not regarded
 * as an object, though it is.
 */
export const isplain = <X>() => wrap(
  'obj.isplain',
  allow<X, Record<string, unknown>>(
    (value) => value !== null
        && typeof value === 'object'
        && !Object.getOwnPropertyDescriptor(value, '__proto__')
        && Object.prototype === Object.getPrototypeOf(value),
    'value is not an object or its prototype is not Object.prototype',
  ),
);

/**
 * Checks that the object obeys a strict structure of properties and property-level validators.
 * The structure needs to define all properties in a plain JavaScript object and its prototype
 * chain is not inspected.
 *
 * It is a strict 1:1 validation. Keys not found on the value will trigger
 * a {@link ValidationError}, including keys found in the `value` but not
 * in the structure. This excludes non-enumerable properties
 * (like `toString` or other built-in functions) or properties defined on symbols.
 * You can disable this strict 1:1 mapping by setting the `lenient` option to `true.
 *
 * The prototype chain of the passed value will be walked and inherited properties will
 * be validated. You can disable this by setting the `own` option to `true`.
 *
 * The `value` is never returned as-is, but is made a copy of with the properties according to
 * the defined `structure`. Therefore, the property-level validators may transform the property
 * values. This safeguards from `instanceof` checks, including prototype-hijacking and similar
 * issues. The returned value will always have the Object prototype, as the prototype chain
 * is not copied.
 *
 * @param structure the definition structure of the object
 * @param options the validation options
 */
export const keys = <X extends Record<string, unknown>, Y, M extends Y>(
  structure: { [K in keyof Y]: Validator<any, Y[K]> },
  options: {
    /** Set the keys that may be missing in the value. */
    missing?: (keyof M)[];
    /** Only validate the value's own properties and ignore inherited properties. */
    own?: boolean;
    /** Don't validate that value matches 1:1 with the structure. */
    lenient?: boolean;
  } = {},
) => {
  const missing: { [key in keyof M]?: true } = {};

  if (options && options.missing && options.missing.length > 0) {
    for (let i = 0; i < options.missing.length; i += 1) {
      missing[options.missing[i]] = true;
    }
  }

  const walkPrototype = !options.own;

  return wrap<X, Y>('obj.keys', (value) => {
    if (value === null || undefined === value) {
      return value;
    }

    let hasReasons = false;
    const reasons: {
      [key: string]: ValidationError;
      [key: number]: ValidationError;
    } = {};

    const output: any = {};

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in structure) {
      try {
        let inspect: any = value;

        do {
          if (!Object.prototype.hasOwnProperty.call(inspect, key)) {
            if ((missing as any)[key]) {
              // still run the validator even if the value is missing, so that if
              // someone has said that the key can be missing but they've put a required validator
              // the validation will fail
              output[key] = (structure as any)[key]((inspect as any)[key]);
              break;
            } else if (!walkPrototype) {
              // value is not allowed to be missing, and we're not allowed
              // to walk the prototype chain to find the value
              // therefore this validation must fail
              throw new ValidationError(
                `own key ${key} in value is missing`,
                key,
              );
            } else {
              // we're allowed to walk the prototype and we're not allowed to
              // have this property missing, so we're going to try and find it
              // in the prototype chain... when we don't find it there we'll
              // exit this loop and throw a validation error that we couldn't
              // find it
            }
          } else {
            output[key] = (structure as any)[key]((inspect as any)[key]);
            break;
          }

          inspect = Object.getPrototypeOf(inspect);
        } while (walkPrototype && inspect !== null);

        if (walkPrototype && inspect === null) {
          throw new ValidationError(
            `key ${key} in value (and prototype chain) is missing`,
            key,
          );
        }
      } catch (error) {
        isError(error, ValidationError, () => {
          reasons[key] = error;
          hasReasons = true;
        });
      }
    }

    if (!options.lenient) {
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const key in value) {
        try {
          if (!Object.prototype.hasOwnProperty.call(structure, key)) {
            throw new ValidationError(
              `key ${key} found in value but not in structure`,
              key,
            );
          }
        } catch (error) {
          isError(error, ValidationError, () => {
            reasons[key] = error;
            hasReasons = true;
          });
        }
      }
    }

    if (hasReasons) {
      throw new ValidationError(
        'value does not match structure',
        value,
        reasons,
      );
    }

    return output;
  });
};

/**
 * Transform an object by adding default values to the obeject. Always creates a copy
 * of the object.
 */
export const defaults = <X extends Record<string, unknown>>(
  def: { [K in keyof X]?: X[K] },
) => wrap(
    'obj.defaults',
    transform<X, X>((value) => ({ ...def, ...value })),
  );

/**
 * Allow only one of the keys in the list to be present on the object. Presence
 * does not mean non-null or non-undefined.
 */
export const xor = <X extends Record<string, unknown>>(fields: (keyof X)[]) => wrap(
  'obj.xor',
  allow<X, X>((value) => {
    const valueKeys = Object.keys(value);

    const xorValue = fields
      .map((field) => valueKeys.indexOf(field as string) + 1)
      .reduce((a, i) => a + i, 0);

    return xorValue === 1;
  }, `value must have only one field present of  ${fields.join(', ')}`),
);

/**
 * Allow only when all of the keys in the list are present on the object. Presence
 * does not mean non-null or non-undefined.
 */
export const and = <X extends Record<string, unknown>>(fields: (keyof X)[]) => wrap<X, X>('obj.and', (value) => {
  if (value === null || undefined === value) {
    return value;
  }

  let reasons: { [key in keyof X]?: ValidationError } | null = null;

  const valueKeys = Object.keys(value);

  fields.forEach((key: keyof X) => {
    try {
      if (valueKeys.indexOf(key as any) < 0) {
        throw new ValidationError('field must be present', value[key]);
      }
    } catch (error) {
      isError(error, ValidationError, () => {
        if (!reasons) {
          reasons = {};
        }

        reasons[key] = error;
      });
    }
  });

  if (reasons) {
    throw new ValidationError(
      `value must contain all of the fields ${fields.join(', ')}`,
      value,
      reasons,
    );
  }

  return value;
});
