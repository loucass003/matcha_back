export class ValidationError extends Error {
  value: unknown;

  text: string;

  reasons?:
    | ValidationError[]
    | { [key: string]: ValidationError; [key: number]: ValidationError };

  index?: number;

  constructor(
    message: string,
    value: unknown,
    reasons?:
      | ValidationError[]
      | { [key: string]: ValidationError; [key: number]: ValidationError },
    index?: number,
  ) {
    super(message);
    this.value = value;
    this.text = message;
    this.reasons = reasons;
    this.index = index;
  }
}

export class ValidationErrorWithField extends ValidationError {
  field: string;

  constructor(field: string, error: ValidationError) {
    super(error.message, error.value, error.reasons);
    this.field = field;
  }
}
