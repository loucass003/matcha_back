import { Client } from "pg";

export function persist<T>(db: Client, entity: T) {
  console.log(db, entity);
}
