export function isError<E extends Error, O>(
  value: Error,
  error: { new (...args: any[]): E },
  func: (e?: E) => O,
): O {
  if (value instanceof error) {
    return func(value);
  }

  throw value;
}
