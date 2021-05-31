import { Response } from "express";
import { IResponseError } from "../commons/types/errors/ResponseError";
import { Status } from "../commons/types/http-status";
import { ResponseErrorType } from "../commons/types/errors/ResponseErrorType";

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
