/* eslint-disable no-new-wrappers */
import { assert } from './test-utils';
import * as any from './any';

describe('validators', () => {
  describe('any', () => {
    assert(any.is(), {
      positive: [null, undefined, 0, '', NaN, {}, []],
    });

    assert(any.instance(Date), {
      positive: [new Date()],
      negative: [
        {},
        [],
        0,
        '',
        NaN,
        false,
        {},
        [],
        new String(),
        new Number(),
        new Boolean(),
      ],
    });

    assert(any.only('a', 'b', 'c'), {
      positive: ['a', 'b', 'c'],
      negative: [
        0,
        NaN,
        new String('a'),
        new String('b'),
        new String('c'),
        false,
        {},
        [],
      ],
    });

    assert(any.values('a', 'b', 'c'), {
      positive: ['a', 'b', 'c'],
      negative: [
        0,
        NaN,
        new String('a'),
        new String('b'),
        new String('c'),
        false,
        {},
        [],
      ],
    });
  });
});
