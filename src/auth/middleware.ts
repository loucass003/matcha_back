import { NextFunction, Response } from 'express';
import { createToken, setAuthHeaders, verifyToken } from '.';
import { AppRequest } from '../types';
import { Session } from './Session';

export function jwtSessionMiddleware(): any {
  return (req: AppRequest, res: Response, next: NextFunction) => {
    const { headers } = req;
    console.log(headers);
    if (headers.authorization) {
      const token = headers.authorization.substring('Bearer '.length);
      const token_data = verifyToken(token);
      if (token_data) {
        console.log(token_data);
        req.session = new Session(token_data.data);
        // Create new token so it does not expires
        setAuthHeaders(res, createToken(token_data.data));
      }
    }
    next();
  };
}
