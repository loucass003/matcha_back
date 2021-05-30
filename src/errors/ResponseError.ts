import { Response } from "express";
import { IResponseError } from "../types/errors/ResponseError";
import { Status } from "../types/http-status";
import { ResponseErrorType } from "../types/errors/ResponseErrorType";

export class ResponseError implements IResponseError {
  type: string;

  status: number;

  message: string;

  constructor(
    type: ResponseErrorType,
    message: string,
    status = Status.InternalServerError
  ) {
    this.type = ResponseErrorType[type];
    this.message = message;
    this.status = status;
  }

  send(res: Response) {
    res.status(this.status).json(this);
  }
}
