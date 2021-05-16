import { inspect } from 'util';
import { ValidationError } from '../ValidationError';
import { Validator } from '../Validator';

export function assert(
  validator: Validator<any, any>,
  options: {
    positive?: any[];
    negative?: any[];
  },
  lenient = false,
) {
  if (!lenient) {
    test('should allow null', () => {
      expect(validator(null)).toBe(null);
    });

    test('should allow undefined', () => {
      expect(validator(undefined)).toBe(undefined);
    });
  }

  (options.positive || []).forEach((value) => {
    test(`should allow ${inspect(value)}`, () => {
      expect(() => validator(value)).not.toThrow();
    });
  });

  (options.negative || []).forEach((value) => {
    test(`should not allow ${inspect(value)}`, () => {
      expect(() => validator(value)).toThrow(ValidationError);
    });
  });
}

export function equality(a: any, b: any): boolean {
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(a) && isNaN(b)) {
    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      a.length === b.length
      && a.reduce((c, i, index) => c && i === b[index], true)
    );
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  return a === b;
}

export function transform<I, O>(
  validator: Validator<I, O>,
  options: {
    positive?: [I, O][];
    negative?: I[];
  },
) {
  test('should transform undefined into undefined', () => {
    expect(validator(undefined as any)).toBe(undefined);
  });

  test('should transform null into null', () => {
    expect(validator(null as any)).toBe(null);
  });

  (options.positive || []).forEach((pair) => {
    const input = pair[0];
    const output = pair[1];

    test(`should transform ${inspect(input)} into ${inspect(output)}`, () => {
      const transformed = validator(input);

      expect(equality(output, transformed)).toBeTruthy();
    });
  });
}
