import { Middleware } from "@decorators/express";
import { Request, Response, NextFunction } from "express";
import { ValidationMiddlewareError } from "../errors/ValidationMiddlewareError";
import { Serialize } from "../commons/serializer";
import {
  ValidationError,
  ValidationErrorWithField,
} from "../commons/validation/ValidationError";
import { Validator } from "../commons/validation/Validator";

export type Rules = Record<string, Validator<any, any>> | Validator<any, any>;

export interface RulesBase {
  query?: Rules;
  body?: Rules;
  cookies?: Rules;
  headers?: Rules;
  params?: Rules;
}

function testValue(
  validator: Validator<any, any>,
  value: any,
  key: string,
  errors: ValidationError[]
) {
  try {
    return validator(value);
  } catch (error) {
    if (!(error instanceof ValidationError)) {
      throw error;
    }
    errors.push(new ValidationErrorWithField(`${key}`, error));
    return value;
  }
}

function isValidator(value: any) {
  return !!value.and;
}

export function ValidationMiddleware(rules: RulesBase): any {
  class ValidationMiddlewareClass implements Middleware {
    public use(req: Request, res: Response, next: NextFunction): void {
      const { query, body, cookies, headers, params } = req;

      const reqFields = {
        query,
        body,
        cookies,
        headers,
        params,
      } as Record<string, any>;

      const errors: ValidationError[] = [];
      for (const [key, value] of Object.entries(rules)) {
        if (isValidator(value)) {
          reqFields[key] = testValue(value, reqFields[key], `${key}`, errors);
        } else {
          for (const [fieldName, rule] of Object.entries(value)) {
            const testField = reqFields[key][fieldName];
            reqFields[key][fieldName] = testValue(
              rule as Validator<any, any>,
              testField,
              `${key}.${fieldName}`,
              errors
            );
          }
        }
      }

      if (errors.length > 0) {
        new ValidationMiddlewareError(
          Serialize(errors, ["validation-middleware"])
        ).send(res);
        return;
      }

      next();
    }
  }
  return ValidationMiddlewareClass;
}
