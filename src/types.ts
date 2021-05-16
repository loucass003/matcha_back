import { NextFunction, Request, Response } from 'express';

export type Location = 'body' | 'cookies' | 'headers' | 'params' | 'query';
export type ExpressMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;
