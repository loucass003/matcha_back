import { Controller, Post, Response } from "@decorators/express";
import express from "express";
import { IRegisterResponse } from "../types/auth/register";

@Controller("/auth")
export class AuthController {
  @Post("/register")
  register(@Response() res: express.Response) {
    res.json({
      id: 0,
    } as IRegisterResponse);
  }
}
