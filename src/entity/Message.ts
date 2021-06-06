import { Client } from "pg";
import { IMessage } from "../commons/types/message";
import { PaginatedResponse } from "../commons/types/PaginatedResponse";

export class Message implements IMessage {
  id?: number;

  from: number;

  to: number;

  content: string;

  date!: Date;

  constructor({ id, from, to, content }: IMessage) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.content = content;
  }

  async insert(db: Client): Promise<Message> {
    const row = await db.query(
      "INSERT INTO messages (user_from, user_to, content) VALUES ($1, $2, $3) RETURNING id, date",
      [this.from, this.to, this.content]
    );
    this.id = row.rows[0].id;
    const date = new Date();
    date.setTime(row.rows[0].date);
    this.date = date;
    return this;
  }

  static async conversation(
    db: Client,
    [user0, user1]: number[],
    page: number,
    itemsPerPages = 25
  ): Promise<PaginatedResponse<Message>> {
    const { rows: messages } = await db.query(
      `/* SQL */
        SELECT
          *
        FROM messages
        WHERE messages.user_to = $1 OR messages.user_to = $2
        ORDER BY date DESC
        OFFSET $3
        LIMIT $4
    `,
      [user0, user1, itemsPerPages * page, itemsPerPages + 1]
    );
    return {
      data: messages.map((message: IMessage) => new Message(message)),
      hasMore: messages.length > itemsPerPages,
      page,
      itemsPerPages,
    };
  }
}
