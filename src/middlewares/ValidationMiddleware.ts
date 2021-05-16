import { Middleware } from '@decorators/express';
import { Request, Response, NextFunction } from 'express';

export function ValidationMiddleware(message: string): any {
  abstract class ValidationMiddlewareClass implements Middleware {
    public use(_: Request, __: Response, next: NextFunction): void {
      console.log(message);
      next();
    }
  }
  return ValidationMiddlewareClass;
}
