import {
  Body,
  Controller,
  Get,
  Params,
  Post,
  Request,
  Response,
} from "@decorators/express";
import express from "express";
import { AppRequest } from "../types";
import { SSE } from "../index";
import { ValidationMiddleware } from "../middlewares/ValidationMiddleware";
import { AuthCheck } from "../middlewares/AuthCheck";
import { sendPacket } from "../utils/sse";
import { Message } from "../entity/Message";
import { User } from "../entity/User";
import { ResponseError } from "../errors/ResponseError";
import { ResponseErrorType } from "../commons/types/errors/ResponseErrorType";
import { Status } from "../commons/types/http-status";
import {
  ChatPacket,
  ISendMessagePost,
  sendMessageSchema,
} from "../commons/types/chat";
import { IDRule } from "../commons/types/common-rules";
import { Serialize } from "../commons/serializer";

@Controller("/chat")
export class ChatController {
  @Get("/conversation/:userWith", [
    AuthCheck(),
    ValidationMiddleware({
      params: {
        userWith: IDRule,
      },
    }),
  ])
  async index(
    @Request() req: AppRequest,
    @Response() res: express.Response,
    @Params("userWith") userWith: number
  ) {
    const { session, db } = req;
    if (!session) return;
    const me = await User.fromId(db, session.id);
    const user = await me?.hasMatch(db, userWith);
    const client = await SSE.subscribe(req, res, "chat");
    if (!user) {
      sendPacket<ChatPacket>(
        "chat",
        Serialize(
          {
            type: "error",
            error: new ResponseError(
              ResponseErrorType.MatchNotFound,
              `conversation with user id ${userWith} not found`,
              Status.NotFound
            ),
          },
          ["chat"]
        ),
        [session.id]
      );
      SSE.unsubscribe(client);
      return;
    }

    const conversation = await Message.conversation(
      db,
      [session.id, userWith],
      0
    );
    sendPacket<ChatPacket>(
      "chat",
      Serialize(
        {
          type: "init",
          userWith: user,
          conversation,
        },
        ["chat"]
      ),
      [session.id]
    );
  }

  @Post("/send-message", [
    AuthCheck(),
    ValidationMiddleware({
      body: sendMessageSchema,
    }),
  ])
  async sendMessage(
    @Request() { session, db }: AppRequest,
    @Response() res: express.Response,
    @Body() { content, to }: ISendMessagePost
  ) {
    if (!session) return;
    const me = await User.fromId(db, session.id);
    const user = await me?.hasMatch(db, to);
    if (!user) {
      new ResponseError(
        ResponseErrorType.MatchNotFound,
        `conversation with user id ${to} not found`,
        Status.NotFound
      ).send(res);
      return;
    }
    const insertedMessage = await new Message({
      content,
      from: session.id,
      to,
    }).insert(db);
    sendPacket<ChatPacket>(
      "chat",
      Serialize({
        type: "message",
        message: insertedMessage,
      }),
      [session.id, to]
    );
  }

  @Get("/conversations", [AuthCheck()])
  async conversations(
    @Request() { session, db }: AppRequest,
    @Response() res: express.Response
  ) {
    if (!session) return;
    res.json(Serialize(await User.conversations(db, session.id), ["chat"]));
  }
}
