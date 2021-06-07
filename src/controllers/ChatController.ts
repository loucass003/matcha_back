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
import { IDParamRule } from "../commons/types/common-rules";
import { Serialize } from "../commons/serializer";
import { Conversation } from "../entity/Conversation";

@Controller("/chat")
export class ChatController {
  @Get("/conversation/:id", [
    AuthCheck(),
    ValidationMiddleware({
      params: {
        id: IDParamRule,
      },
    }),
  ])
  async index(
    @Request() req: AppRequest,
    @Response() res: express.Response,
    @Params("id") id: number
  ) {
    const { session, db } = req;
    if (!session) return;
    const conversation = await Conversation.fromId(db, id);
    const client = await SSE.subscribe(req, res, "chat");
    if (!conversation) {
      sendPacket<ChatPacket>(
        "chat",
        {
          type: "error",
          error: new ResponseError(
            ResponseErrorType.ConversationNotFound,
            `conversation with id ${conversation} not found`,
            Status.NotFound
          ),
        },
        [session.id]
      );
      SSE.unsubscribe(client);
      return;
    }
    sendPacket<ChatPacket>(
      "chat",
      Serialize(
        {
          type: "init",
          conversation,
          messages: await conversation.messages(db, 0),
        },
        ["chat"]
      ),
      [session.id]
    );
  }

  // @Get("/messages/:conversationId/:page", [
  //   AuthCheck(),
  //   ValidationMiddleware({
  //     body: sendMessageSchema,
  //   }),
  // ])
  // async messages() {}

  @Post("/send-message", [
    AuthCheck(),
    ValidationMiddleware({
      body: sendMessageSchema,
    }),
  ])
  async sendMessage(
    @Request() { session, db }: AppRequest,
    @Response() res: express.Response,
    @Body() { content, conversation }: ISendMessagePost
  ) {
    if (!session) return;
    const conv = await Conversation.fromId(db, conversation);
    if (!conv) {
      new ResponseError(
        ResponseErrorType.ConversationNotFound,
        `conversation with id ${conversation} not found`,
        Status.NotFound
      ).send(res);
      return;
    }
    if (!conv.open) {
      new ResponseError(
        ResponseErrorType.ConversationClosed,
        `Cannot send a message to a closed conversation`,
        Status.BadRequest
      ).send(res);
      return;
    }
    const insertedMessage = await new Message({
      content,
      user_from: session.id,
      conversation,
    }).insert(db);
    if (conv.user_0.id && conv.user_1.id) {
      sendPacket<ChatPacket>(
        "chat",
        Serialize({
          type: "message",
          message: insertedMessage,
        }),
        [conv.user_0.id, conv.user_1.id]
      );
    }
    res.sendStatus(200);
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
