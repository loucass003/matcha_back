import { Middleware } from "@decorators/express";
import { NextFunction } from "@decorators/socket";
import { Response } from "express";
import { ResponseErrorType } from "../commons/types/errors/ResponseErrorType";
import { Status } from "../commons/types/http-status";
import { ResponseError } from "../errors/ResponseError";
import { AppRequest } from "../types";

export function AuthCheck(): any {
  class AuthMiddlewareClass implements Middleware {
    public use(req: AppRequest, res: Response, next: NextFunction): void {
      if (!req.session) {
        new ResponseError(
          ResponseErrorType.UserNotAuthenticated,
          `User is not authenticated`,
          Status.Unauthorized
        ).send(res);
        return;
      }
      next();
    }
  }
  return AuthMiddlewareClass;
}
