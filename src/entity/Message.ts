import { Client } from "pg";
import { IMessage } from "../commons/types/message";

export class Message implements IMessage {
  id?: number;

  user_from: number;

  conversation: number;

  content: string;

  date?: string;

  constructor({ id, user_from, conversation, content, date }: IMessage) {
    this.id = id;
    this.user_from = user_from;
    this.conversation = conversation;
    this.content = content;
    this.date = date;
  }

  async insert(db: Client): Promise<Message> {
    const {
      rows: [message],
    } = await db.query(
      "INSERT INTO messages (user_from, conversation, content) VALUES ($1, $2, $3) RETURNING id, date",
      [this.user_from, this.conversation, this.content]
    );
    this.id = message.id;
    this.date = (message.date as Date).toISOString();
    return this;
  }

  static fromRow(row: any) {
    return new Message({
      ...row,
      date: (row.date as Date).toISOString(),
    });
  }
}
