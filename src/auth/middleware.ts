import { NextFunction, Response } from "express";
import { createToken, setAuthHeaders, verifyToken } from ".";
import { AppRequest } from "../types";

export function jwtSessionMiddleware(): any {
  return (req: AppRequest, res: Response, next: NextFunction) => {
    const { headers } = req;
    req.session = undefined;
    if (headers.authorization) {
      const token = headers.authorization.substring("Bearer ".length);
      const tokenData = verifyToken(token);
      if (tokenData) {
        console.log(tokenData);
        req.session = tokenData.data;
        // Create new token so it does not expires
        console.log("SET NEW TOKEN");
        setAuthHeaders(res, createToken(tokenData.data));
      }
    }
    next();
  };
}
