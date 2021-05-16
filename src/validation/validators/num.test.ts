/* eslint-disable no-new-wrappers */
import { assert, transform } from './test-utils';
import * as num from './num';

describe('validators', () => {
  describe('num', () => {
    describe('is', () => {
      assert(num.is(), {
        positive: [0, 1, -1],
        negative: [NaN, '', '-1', '0', '1', false, {}, [], new Number(0)],
      });
    });

    describe('isNaN', () => {
      assert(num.isNaN(), {
        positive: [0, 1, -1, NaN],
        negative: [false, '', '-1', '0', '1', {}, [], new Number(0)],
      });
    });

    describe('isInteger', () => {
      assert(num.isInteger(), {
        positive: [0, 0.0, -0.0, 1.0, -1.0, 1.0, -1.0, 1, -1],
        negative: [
          0.1,
          -0.1,
          NaN,
          false,
          '',
          '-1',
          '0',
          '1',
          {},
          [],
          new Number(0),
        ],
      });
    });

    describe('min(1)', () => {
      assert(num.min(1), {
        positive: [1, 2],
        negative: [NaN, 0, -1],
      });
    });

    describe('max(1)', () => {
      assert(num.max(1), {
        positive: [-1, 0, 1],
        negative: [NaN, 2],
      });
    });

    describe('parse', () => {
      transform(num.parse(), {
        positive: [
          ['0', 0],
          ['1', 1],
          ['-1', -1],
          ['+1', 1],
          ['-1.23', -1.23],
          ['not-a-number', NaN],
        ],
      });
    });

    describe('parse (with throwOnNaN set to true)', () => {
      transform(num.parse({ throwOnNaN: true }), {
        positive: [
          ['0', 0],
          ['1', 1],
          ['-1', -1],
          ['+1', 1],
          ['-1.23', -1.23],
        ],
        negative: ['not-a-number'],
      });
    });

    describe('integer', () => {
      transform(num.integer(), {
        positive: [
          [0, 0],
          [1, 1],
          [-1, -1],
          [NaN, NaN],
          [0.1, 0],
          [-0.1, 0],
          [1.1, 1],
          [-1.1, -1],
        ],
      });
    });
  });
});
