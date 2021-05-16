import { wrap } from '../wrap';

/**
 * A generic validator that really doesn't check for anything. It accepts every value,
 * but is important in keeping strict null typing.
 */
export const optional = <X>() => wrap<unknown, X | null | undefined>('optional', (value) => value as any);
