/* eslint-disable no-new-wrappers */
import { assert, equality } from './test-utils';
import * as array from './array';
import * as str from './str';
import * as num from './num';
import { wrap } from '../wrap';
import { ValidationError } from '../ValidationError';

describe('validators', () => {
  describe('array', () => {
    describe('is', () => {
      assert(array.is(), {
        positive: [null, undefined, []],
        negative: [NaN, 0, '', {}, { length: 3 }],
      });
    });

    describe('items(str.is())', () => {
      assert(array.items(str.is()), {
        positive: [[], [null], [undefined], [''], ['', '']],
        negative: [[0], [false], [{}], [[]]],
      });
    });

    describe('items(num.integer())', () => {
      test('should return a copied transformed array when an element is transformed', () => {
        const input = [0, 1, 2, 3.1, 4, 5];
        const output = [0, 1, 2, 3, 4, 5];

        const transformed = array.items(num.integer())(input);

        expect(transformed).not.toBe(output);
        expect(equality(output, transformed)).toBeTruthy();
      });

      test('should return the input array when no element is transformed', () => {
        const input = [0, 1, 2, 3, 4, 5];

        const transformed = array.items(num.integer())(input);
        expect(transformed).toBe(input);
      });
    });

    describe('items() error handling', () => {
      test('should throw a non-validation error immediately', () => {
        class TestError extends Error {}
        expect(() => {
          array.items(
            wrap('errortest', () => {
              throw new TestError();
            }),
          )([0]);
        }).toThrowError(TestError);
      });

      test('should throw validation error with a reason array', () => {
        const input = [0, 1];
        try {
          array.items(str.is())(input);
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          const { reasons } = error;
          expect(reasons).toBeArray();
          expect(reasons).toBeArrayOfSize(input.length);
          reasons.forEach((reason: any) => {
            expect(reason).toBeInstanceOf(ValidationError);
          });
        }
      });
    });

    describe('min(1)', () => {
      assert(array.min(1), {
        positive: [[1], [1, 2]],
        negative: [[]],
      });
    });

    describe('max(1)', () => {
      assert(array.max(1), {
        positive: [[], [1]],
        negative: [[1, 2]],
      });
    });

    describe('length(1, 2)', () => {
      assert(array.length(1, 2), {
        positive: [[1], [1, 2]],
        negative: [[], [1, 2, 3]],
      });
    });
  });
});
