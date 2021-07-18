import { Status } from "../commons/types/http-status";
import { ValidationError } from "../commons/validation/ValidationError";
import { ResponseError } from "./ResponseError";
import { ResponseErrorType } from "../commons/types/errors/ResponseErrorType";

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
