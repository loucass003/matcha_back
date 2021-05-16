import { allow } from '../allow';
import { transform } from '../transform';
import { wrap } from '../wrap';

export const is = <X>() => wrap('any.is', transform<X, any>((value) => value));

export const only = <X, O extends any[]>(...values: O) => wrap(
  'any.only',
  allow<X, O extends(infer R)[] ? R : never>(
    (value) => values.indexOf(value as any) > -1,
  `value is not one of ${values.map((value) => `${value}`).join(', ')}`),
);

/**
   * Check that the value is an instance of the constructor.
   */
export const instance = <X, C>(constructor: { new (...args: any[]): C }) => wrap(
  'any.instance',
  allow<X, C>((value) => value instanceof constructor, `value not an instance of ${constructor}`),
);

export const values = only;
