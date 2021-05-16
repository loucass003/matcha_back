import { Validator } from './Validator';

export function wrap<I, X>(name: string, func: (value: I) => X): Validator<I, X> {
  const container = {
    [name]: (value: I) => func(value),
  };

  const validatorFunction: any = container[name];

  return Object.assign(validatorFunction, {
    and: <B>(validator: Validator<X, B>): Validator<I, B> => wrap<I, B>(`${name}.and(${validator.name})`, (value) => validator(validatorFunction(value))),
  });
}
