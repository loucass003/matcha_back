import { TransferNullability } from './types';

export interface Validator<Input, Output> {
    (value: Input): Output;

    /**
     * Creates a new validator by combining the validation logic of the this validator
     * and the provide validator, in order.
     */
    and<NewOutput>(
      validator: Validator<Output, TransferNullability<Output, NewOutput>>
    ): Validator<Input, TransferNullability<Output, NewOutput>>;
  }
