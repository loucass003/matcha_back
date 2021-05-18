import { Response } from 'express';
import { Status } from '../utils/http-status';
import { ResponseErrorType } from './ResponseErrorType';

export class ResponseError {
  type: string;

  status: number;

  message: string;

  constructor(
    type: ResponseErrorType,
    message: string,
    status = Status.InternalServerError,
  ) {
    this.type = ResponseErrorType[type];
    this.message = message;
    this.status = status;
  }

  send(res: Response) {
    res.json(this).status(this.status);
  }
}
