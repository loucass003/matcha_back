import { Client } from "pg";
import { exit } from "process";
import faker from "faker";
import { generateUsers } from "./users";

export const {
  POSTGRES_DSN,
}: {
  POSTGRES_DSN: string;
} = process.env as any;

async function init() {
  faker.seed(69);

  const db = new Client({
    connectionString: POSTGRES_DSN,
  });
  await db.connect();

  console.log("generating users");
  await generateUsers(faker, db, 500);
  console.log("done");
  exit(0);
}

init();
