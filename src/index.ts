import { attachControllers } from "@decorators/express";
import express, { Application } from "express";
import { Client } from "pg";
import cors from "cors";
import { SseChannels } from "@dropb/sse-channels";
import controllers from "./controllers";
import { logger, loggerMiddleware } from "./logger";
import { jwtSessionMiddleware } from "./auth/middleware";
import { databaseMiddleware } from "./database/middleware";
import { Message } from "./entity/Message";
import { find } from "./sql/find";
import { User } from "./entity/User";

export { logger };

export const {
  PORT,
  JWT_SECRET,
  POSTGRES_DSN,
  SENDGRID_API_KEY,
}: {
  PORT: number;
  JWT_SECRET: string;
  POSTGRES_DSN: string;
  SENDGRID_API_KEY: string;
} = process.env as any;

export const SSE = new SseChannels();
export class Main {
  public app?: Application;

  public db_client?: Client;

  public async init(): Promise<void> {
    console.log(Message);
    // registerEntities([Message]);
    this.db_client = new Client({
      connectionString: POSTGRES_DSN,
    });
    await this.db_client.connect();
    logger.info("Connected to database");

    find(this.db_client, User, { likes: { id: 1 } });

    this.app = express();

    const origin = "http://localhost:3000";
    this.app.use(
      cors({
        origin,
      })
    );
    // BIG HACK because the library we are useing does not support cors corectly
    // so i have to inject the corect headers
    (SSE as any).headers = {
      ...(SSE as any).headers,
      "access-control-allow-origin": origin,
      "Access-Control-Allow-Credentials": true,
    };
    this.app.use(express.json());
    this.app.use(databaseMiddleware(this.db_client));
    this.app.use(jwtSessionMiddleware());
    this.app.use(loggerMiddleware());
    attachControllers(this.app, controllers);
    this.app.listen(PORT, () => {
      logger.info(`Connected on port ${PORT}`);
    });
  }
}

new Main().init();
