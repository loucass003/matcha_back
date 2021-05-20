import { Request } from "express";
import { Client } from "pg";
import { Session } from "./auth/Session";

export type AppRequest = Request & {
  session?: Session;
  db: Client;
};
