import { Middleware } from '@decorators/express';
import { Request, Response, NextFunction } from 'express';
import { ValidationMiddlewareError } from '../errors/ValidationMiddlewareError';
import {
  ValidationError,
  ValidationErrorWithField,
} from '../validation/ValidationError';
import { Validator } from '../validation/Validator';

export interface RulesBase {
  query?: Record<string, Validator<any, any>>;
  body?: Record<string, Validator<any, any>>;
  cookies?: Record<string, Validator<any, any>>;
  headers?: Record<string, Validator<any, any>>;
  params?: Record<string, Validator<any, any>>;
}

export function ValidationMiddleware(rules: RulesBase): any {
  class ValidationMiddlewareClass implements Middleware {
    public use(req: Request, res: Response, next: NextFunction): void {
      const {
        query, body, cookies, headers, params,
      } = req;

      const reqFields = {
        query,
        body,
        cookies,
        headers,
        params,
      } as Record<string, any>;

      const errors = [];
      for (const [key, value] of Object.entries(rules)) {
        for (const [fieldName, rule] of Object.entries(value)) {
          const testField = reqFields[key][fieldName];
          try {
            reqFields[key][fieldName] = (rule as Validator<any, any>)(
              testField,
            );
          } catch (error) {
            if (!(error instanceof ValidationError)) {
              throw error;
            }
            delete error.value;
            if (error.reasons) {
              if (Array.isArray(error.reasons)) {
                error.reasons.forEach(
                  (reason: ValidationError) => delete reason.value,
                );
              } else {
                Object.keys(error.reasons).forEach(
                  (k: string | number) => delete error.reasons[k],
                );
              }
            }
            errors.push(
              new ValidationErrorWithField(`${key}.${fieldName}`, error),
            );
          }
        }
      }

      if (errors.length > 0) {
        new ValidationMiddlewareError(errors).send(res);
        return;
      }

      next();
    }
  }
  return ValidationMiddlewareClass;
}
