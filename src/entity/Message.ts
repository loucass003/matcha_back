import { Client } from "pg";
import { IMessage } from "../commons/types/message";

export class Message implements IMessage {
  id?: number;

  user_from: number;

  conversation: number;

  content: string;

  date!: Date;

  constructor({ id, user_from, conversation, content }: IMessage) {
    this.id = id;
    this.user_from = user_from;
    this.conversation = conversation;
    this.content = content;
  }

  async insert(db: Client): Promise<Message> {
    const row = await db.query(
      "INSERT INTO messages (user_from, conversation, content) VALUES ($1, $2, $3) RETURNING id, date",
      [this.user_from, this.conversation, this.content]
    );
    this.id = row.rows[0].id;
    const date = new Date();
    date.setTime(row.rows[0].date);
    this.date = date;
    return this;
  }
}
