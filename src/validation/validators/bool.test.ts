/* eslint-disable no-new-wrappers */
import * as bool from './bool';
import { assert, transform } from './test-utils';

describe('validators', () => {
  describe('bool', () => {
    describe('is', () => {
      assert(bool.is(), {
        positive: [true, false],
        negative: [NaN, '', 0, {}, [], new Boolean(false)],
      });
    });

    describe('truth', () => {
      assert(bool.truth(), {
        positive: [true],
        negative: [false, 0, 1, -1, NaN, '', 'a', {}, [], new Boolean(false), new Boolean(true)],
      });
    });

    describe('falseness', () => {
      assert(bool.falseness(), {
        positive: [false],
        negative: [true, 0, -1, 1, NaN, '', 'a', {}, [], new Boolean(true), new Boolean(false)],
      });
    });

    describe('truthy', () => {
      transform(bool.truthy(), {
        positive: [
          [1, true],
          [-1, true],
          [true, true],
          [new Boolean(true), true],
          [new Boolean(false), true],
          ['true', true],
          [{}, true],
          [[], true],
          [0, false],
          ['', false],
          [false, false],
          [NaN, false],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ] as any,
      });
    });

    describe('falsy', () => {
      transform(bool.falsy(), {
        positive: [
          [1, false],
          [-1, false],
          [true, false],
          [new Boolean(true), false],
          [new Boolean(false), false],
          ['true', false],
          [{}, false],
          [[], false],
          [0, true],
          ['', true],
          [false, true],
          [NaN, true],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ] as any,
      });
    });
  });
});
