import { required } from '..';
import { assert } from './test-utils';

describe('validators', () => {
  describe('required', () => {
    assert(
      required(),
      {
        positive: [0, '', NaN, {}, []],
        negative: [null, undefined],
      },
      true,
    );
  });
});
