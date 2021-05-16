/* eslint-disable no-new-wrappers */
import { assert, transform } from './test-utils';
import * as str from './str';

describe('validators', () => {
  describe('str', () => {
    describe('is', () => {
      assert(str.is(), {
        positive: ['', 'string'],
        negative: [0, false, {}, [], new String('string')],
      });
    });

    describe('nonempty', () => {
      assert(str.nonempty(), {
        positive: ['string'],
        negative: ['', 0, false, {}, [], new String('string')],
      });
    });

    describe('min(1)', () => {
      assert(str.min(1), {
        positive: ['o', 'on', 'one'],
        negative: [''],
      });
    });

    describe('max(1)', () => {
      assert(str.max(1), {
        positive: ['', 'o'],
        negative: ['on'],
      });
    });

    describe('length(1, 2)', () => {
      assert(str.length(1, 2), {
        positive: ['o', 'on'],
        negative: ['', 'one'],
      });
    });

    describe('regex(/[a-z]/i)', () => {
      assert(str.regex(/^[abc]$/i), {
        positive: ['a', 'b', 'c'],
        negative: ['', 'ab', 'bc', 'ca', 'not', '0'],
      });
    });

    describe("regex(/^[^a]?(a?)[^a]?$/, '$1')", () => {
      transform(str.regex(/^[^a]?(a?)[^a]?$/, '$1'), {
        positive: [
          ['', ''],
          ['a', 'a'],
          [' a', 'a'],
          ['a ', 'a'],
          [' a ', 'a'],
        ],
        negative: ['aba'],
      });
    });
  });
});
