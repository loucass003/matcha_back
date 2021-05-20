import { NextFunction, Response } from "express";
import { createToken, setAuthHeaders, verifyToken } from ".";
import { AppRequest } from "../types";
import { Session } from "./Session";

export function jwtSessionMiddleware(): any {
  return (req: AppRequest, res: Response, next: NextFunction) => {
    const { headers } = req;
    if (headers.authorization) {
      const token = headers.authorization.substring("Bearer ".length);
      const tokenData = verifyToken(token);
      if (tokenData) {
        console.log(tokenData);
        req.session = new Session(tokenData.data);
        // Create new token so it does not expires
        setAuthHeaders(res, createToken(tokenData.data));
      }
    }
    next();
  };
}
