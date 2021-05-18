import { NextFunction } from '@decorators/socket';
import { Response } from 'express';
import { Client } from 'pg';
import { AppRequest } from '../types';

export function databaseMiddleware(db_client: Client): any {
  return (req: AppRequest, _: Response, next: NextFunction) => {
    req.db = db_client;
    next();
  };
}
