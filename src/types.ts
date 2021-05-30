import { Request } from "express";
import { Client } from "pg";
import { IUserSession } from "./types/user";

export type AppRequest = Request & {
  session?: IUserSession;
  db: Client;
};
