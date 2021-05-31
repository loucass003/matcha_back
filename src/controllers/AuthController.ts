import { Body, Controller, Post, Request, Response } from "@decorators/express";
import express from "express";
import { User } from "../entity/User";
import { ResponseError } from "../errors/ResponseError";
import { ResponseErrorType } from "../commons/types/errors/ResponseErrorType";
import { AppRequest } from "../types";
import {
  IRegisterPost,
  IRegisterResponse,
  registerPostSchema,
} from "../commons/types/auth/register";
import { Status } from "../commons/types/http-status";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  ILoginPost,
  ILoginResponse,
  loginPostSchema,
} from "../commons/types/auth/login";
import { createToken, verifyToken } from "../auth";
import { IUserSession } from "../commons/types/user";
import { ActivationMail, MailTemplateType, sendMail } from "../utils/email";
import {
  activationPostSchema,
  IActivatePost,
  IActivateResponse,
} from "../commons/types/auth/activate";
import {
  IPasswordResetPost,
  passwordResetSchema,
} from "../commons/types/auth/password-reset";
import { ValidationMiddleware } from "../middlewares/ValidationMiddleware";

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
      const user = await new User({
        firstname,
        lastname,
        password: await hashPassword(password),
        email,
        activated: false,
      }).insert(db);

      const activationToken = createToken({ user: user.id });
      sendMail<ActivationMail>(
        {
          activationToken,
          firstname: user.firstname,
          templateId: MailTemplateType.Activation,
        },
        user.email,
        "Activate your account"
      );

      res.json({
        id: user.id,
      } as IRegisterResponse);
    } catch (e) {
      if (e.detail?.includes("already exists")) {
        new ResponseError(
          ResponseErrorType.UserAlreadyExist,
          `Email ${email} already in use`,
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
    const user = await User.fromEmail(db, email);
    if (!user) {
      new ResponseError(
        ResponseErrorType.UserNotFound,
        `User with email ${email} not found`,
        Status.NotFound
      ).send(res);
      return;
    }

    if (!user.activated) {
      new ResponseError(
        ResponseErrorType.UserNotActivated,
        `Your account is not activated. Please check your mail ${email}`,
        Status.BadRequest
      ).send(res);
      return;
    }

    if (!(await verifyPassword(user.password, password))) {
      new ResponseError(
        ResponseErrorType.UserInvalidPassword,
        `Invalid password for user with email ${email}`,
        Status.BadRequest
      ).send(res);
      return;
    }
    res.json({
      token: createToken<IUserSession>(user.toSession()),
    } as ILoginResponse);
  }

  @Post("/activate", [
    ValidationMiddleware({
      body: activationPostSchema,
    }),
  ])
  async activate(
    @Request() { db }: AppRequest,
    @Response() res: express.Response,
    @Body() { activationToken }: IActivatePost
  ) {
    const tokenData = verifyToken(activationToken);
    if (!tokenData) {
      new ResponseError(
        ResponseErrorType.UserInvalidActivationToken,
        `Invalid or expired activation token`,
        Status.BadRequest
      ).send(res);
      return;
    }
    const user = await User.fromId(db, tokenData.data.user);
    if (!user) {
      new ResponseError(
        ResponseErrorType.UserNotFound,
        `User with id ${tokenData.data.user} not found`,
        Status.NotFound
      ).send(res);
      return;
    }
    if (user.activated) {
      new ResponseError(
        ResponseErrorType.UserAlreadyActivated,
        `User with id ${user.id} is already activated`,
        Status.BadRequest
      ).send(res);
      return;
    }
    await user.update(db, { activated: true });
    res.json({
      token: createToken<IUserSession>(user.toSession()),
    } as IActivateResponse);
  }

  @Post("/password_reset", [
    ValidationMiddleware({
      body: passwordResetSchema,
    }),
  ])
  async password_reset(
    // @Request() { db }: AppRequest,
    @Response() res: express.Response,
    @Body() { reset, email }: IPasswordResetPost
  ) {
    if (email) {
      console.log("send mail");
    } else if (reset) {
      console.log("reset", reset);
    }
    res.sendStatus(200);
  }
}
