/* eslint-disable no-new-wrappers */
import * as obj from './obj';
import * as str from './str';
import * as num from './num';
import { required } from './required';
import { assert, transform } from './test-utils';
import { ValidationError } from '../ValidationError';
import { wrap } from '../wrap';

describe('validators', () => {
  describe('obj', () => {
    describe('is()', () => {
      assert(obj.is(), {
        positive: [
          [],
          {},
          new Date(),
          new String('hello'),
          new Number(1),
          new Boolean(false),
        ],
        negative: [NaN, false, '', 0],
      });
    });

    describe('isplain()', () => {
      assert(obj.isplain(), {
        positive: [{}, { actAsObject: true, __proto__: Object.prototype }],
        negative: [
          { actAsFunction: true, __proto__: Function.prototype },
          [],
          new String(),
        ],
      });
    });

    describe('keys({ a: str.is(), b: num.is() })', () => {
      assert(
        obj.keys({
          a: required().and(str.is()),
          b: required().and(num.is()),
        }),
        {
          positive: [
            { a: '', b: 0 },
            { a: 'hello', b: 2 },
          ],
          negative: [
            { a: 'a', b: 0, c: 'c' },
            { a: 0, b: 0 },
            { a: 'hello', b: 'world' },
            {},
            { a: 'hello' },
            { b: 0 },
          ],
        },
      );
    });

    describe('keys() error handling', () => {
      test('should throw a non-validation error immediately', () => {
        class TestError extends Error {}
        expect(() => {
          obj.keys({
            a: wrap<unknown, string>('testerror', () => {
              throw new TestError();
            }),
          })({ a: 0 });
        }).toThrowError(TestError);
      });

      test('should throw validation error with object reason', () => {
        const input = { a: 0, b: '' };
        try {
          obj.keys({ a: str.is(), b: str.is() })(input);
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          const { reasons } = error;
          expect(reasons).toBeObject();
          expect(reasons.a).toBeInstanceOf(ValidationError);
        }
      });
    });

    describe("keys({ a: num.is(), b: num.is() }, { missing: ['a'] })", () => {
      const validator = obj.keys(
        {
          a: num.is(),
          b: num.is(),
        },
        { missing: ['a'] },
      );

      assert(validator, {
        positive: [{ a: 0, b: 0 }, { b: 0 }],
        negative: [{ a: 0 }, {}],
      });
    });

    describe("keys({ a: required().and(num.is()), b: num.is() }, { missing: ['a']} })", () => {
      const validator = obj.keys(
        {
          a: required().and(num.is()),
          b: num.is(),
        },
        { missing: ['a'] },
      );

      assert(validator, {
        positive: [{ a: 0, b: 0 }],
        negative: [{ a: 0 }, { b: 0 }, {}],
      });
    });

    describe('keys({ a: required().and(num.is()), b: required().and(str.is()) }, { lenient: true })', () => {
      assert(
        obj.keys(
          {
            a: required().and(num.is()),
            b: required().and(str.is()),
          },
          { lenient: true },
        ),
        {
          positive: [
            { a: 1, b: '1' },
            { a: 1, b: '1', c: '2' },
          ],
          negative: [{}, { a: 1 }, { b: '1' }, { a: '1', b: '1' }, { c: 1 }],
        },
      );
    });

    describe("xor(['a', 'b'])", () => {
      assert(obj.xor(['a', 'b']), {
        positive: [
          { a: 0, c: 1 },
          { b: 0, c: 1 },
        ],
        negative: [{ a: 0, b: 1 }, { a: 0, b: 1, c: 2 }, { c: 0 }, {}],
      });
    });

    describe("and(['a', 'b'])", () => {
      assert(obj.and(['a', 'b']), {
        positive: [
          { a: 0, b: 1 },
          { a: 0, b: 1, c: 2 },
        ],
        negative: [
          {},
          { a: 0 },
          { b: 0 },
          { c: 1 },
          { a: 0, c: 1 },
          { b: 0, c: 2 },
        ],
      });
    });

    describe('defaults', () => {
      transform(
        obj.defaults<{ a?: number; b?: string; c?: boolean }>({
          a: 1,
          b: 'b',
          c: false,
        }),
        {
          positive: [
            [{}, { a: 1, b: 'b', c: false }],
            [{ a: 2 }, { a: 2, b: 'b', c: false }],
            [{ b: 'hello' }, { a: 1, b: 'hello', c: false }],
            [{ c: true }, { a: 1, b: 'b', c: true }],
          ],
        },
      );
    });
  });
});
