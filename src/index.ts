import { attachControllers } from "@decorators/express";
import express, { Application } from "express";
import { Client } from "pg";
import controllers from "./controllers";
import { logger, loggerMiddleware } from "./logger";
import { jwtSessionMiddleware } from "./auth/middleware";
import { databaseMiddleware } from "./database/middleware";

export { logger };

export const {
  PORT,
  JWT_SECRET,
  POSTGRES_DSN,
}: {
  PORT: number;
  JWT_SECRET: string;
  POSTGRES_DSN: string;
} = process.env as any;

export class Main {
  public app?: Application;

  public db_client?: Client;

  public async init(): Promise<void> {
    this.db_client = new Client({
      connectionString: POSTGRES_DSN,
    });
    await this.db_client.connect();
    logger.info("Connected to database");

    this.app = express();

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
