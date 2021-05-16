export class ValidationError extends Error {
    value: unknown;

    reasons?: ValidationError[]
        | { [key: string]: ValidationError; [key: number]: ValidationError };

    constructor(
      message: string,
      value: unknown,
      reasons?: ValidationError[]
        | { [key: string]: ValidationError; [key: number]: ValidationError },
    ) {
      super(message);
      this.value = value;
      this.reasons = reasons;
    }
}
