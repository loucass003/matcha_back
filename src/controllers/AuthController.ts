import { Body, Controller, Post, Request, Response } from "@decorators/express";
import express from "express";
import { User } from "../entity/User";
import { ResponseError } from "../errors/ResponseError";
import { ResponseErrorType } from "../types/errors/ResponseErrorType";
import { ValidationMiddleware } from "../middlewares/ValidationMiddleware";
import { AppRequest } from "../types";
import {
  IRegisterPost,
  IRegisterResponse,
  registerPostSchema,
} from "../types/auth/register";
import { Status } from "../types/http-status";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  ILoginPost,
  ILoginResponse,
  loginPostSchema,
} from "../types/auth/login";
import { createToken } from "../auth";
import { IUserSession } from "../types/user";

@Controller("/auth")
export class AuthController {
  @Post("/register", [
    ValidationMiddleware({
      body: registerPostSchema,
    }),
  ])
  async register(
    @Request() { db }: AppRequest,
    @Response() res: express.Response,
    @Body() { firstname, lastname, password, email }: IRegisterPost
  ) {
    try {
      const { id } = await new User({
        firstname,
        lastname,
        password: await hashPassword(password),
        email,
      }).insert(db);

      res.json({
        id,
      } as IRegisterResponse);
    } catch (e) {
      if (e.detail?.includes("already exists")) {
        new ResponseError(
          ResponseErrorType.UserAlreadyExist,
          `email ${email} already in use`,
          Status.BadRequest
        ).send(res);
        return;
      }
      throw e;
    }
  }

  @Post("/login", [
    ValidationMiddleware({
      body: loginPostSchema,
    }),
  ])
  async login(
    @Request() { db }: AppRequest,
    @Response() res: express.Response,
    @Body() { password, email }: ILoginPost
  ) {
    const [user] = await User.fromEmail(db, email);
    if (!user) {
      new ResponseError(
        ResponseErrorType.UserNotFound,
        `user with email ${email} not found`,
        Status.BadRequest
      ).send(res);
      return;
    }
    if (!(await verifyPassword(user.password, password))) {
      new ResponseError(
        ResponseErrorType.UserNotFound,
        `invalid password for user with email ${email}`,
        Status.BadRequest
      ).send(res);
      return;
    }
    res.json({
      token: createToken<IUserSession>(user.toSession()),
    } as ILoginResponse);
  }
}
