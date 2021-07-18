import { Request } from "express";
import { Client } from "pg";
import { IUserSession } from "./commons/types/user";

export type AppRequest = Request & {
  session?: IUserSession;
  db: Client;
};
