import { Status } from "../types/http-status";
import { ValidationError } from "../validation/ValidationError";
import { ResponseError } from "./ResponseError";
import { ResponseErrorType } from "./ResponseErrorType";

export class ValidationMiddlewareError extends ResponseError {
  errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(
      ResponseErrorType.ValidationError,
      "Query validation error",
      Status.BadRequest
    );
    this.errors = errors;
  }
}
