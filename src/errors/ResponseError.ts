import { Response } from "express";
import { IResponseError } from "../types/errors/ResponseError";
import { Status } from "../types/http-status";
import { ResponseErrorType } from "./ResponseErrorType";

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
    res.json(this).status(this.status);
  }
}
