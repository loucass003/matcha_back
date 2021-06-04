import { Controller, Get, Request, Response } from "@decorators/express";
import express from "express";
import { AppRequest } from "../types";
import { SSE } from "../index";

@Controller("/chat")
export class ChatController {
  @Get("/")
  async index(@Request() req: AppRequest, @Response() res: express.Response) {
    await SSE.subscribe(req, res, "chat");
    SSE.publish("chat", { hello: "world" });
  }

  @Get("/test")
  test(@Response() res: express.Response) {
    console.log(res.getHeaders());
  }
}
