import { Client } from "pg";
import { IConversation } from "../commons/types/conversation";
import { IMessage } from "../commons/types/message";
import { PaginatedResponse } from "../commons/types/PaginatedResponse";
import { IUser } from "../commons/types/user";
import { mapJoin, selectJoin } from "../utils/sql";
import { Message } from "./Message";
import { User } from "./User";

export class Conversation implements IConversation {
  id?: number;

  user_0: IUser;

  user_1: IUser;

  open: boolean;

  constructor({ id, user_0, user_1, open }: IConversation) {
    this.id = id;
    this.user_0 = user_0;
    this.user_1 = user_1;
    this.open = open;
  }

  async messages(
    db: Client,
    page: number,
    itemsPerPages = 25
  ): Promise<PaginatedResponse<Message>> {
    const { rows: messages } = await db.query(
      `/* SQL */
        SELECT
          *
        FROM messages
        WHERE messages.conversation = $1
        ORDER BY date DESC
        OFFSET $2
        LIMIT $3
    `,
      [this.id, itemsPerPages * page, itemsPerPages + 1]
    );
    return {
      data: messages.map((message: IMessage) => new Message(message)),
      hasMore: messages.length > itemsPerPages,
      page,
      itemsPerPages,
    };
  }

  static select(sqlprefix: string) {
    return `/* SQL */
      SELECT 
          conversations.*,
          ${selectJoin<IUser>("U0", "user_0", ["id", "firstname", "lastname"])},
          ${selectJoin<IUser>("U1", "user_1", ["id", "firstname", "lastname"])}
        FROM conversations
          INNER JOIN users U0 ON U0.id = conversations.user_0
          INNER JOIN users U1 ON U1.id = conversations.user_1
        ${sqlprefix}
    `;
  }

  static fromRow(row: any): Conversation {
    const { id, open, ...others } = row;
    return new Conversation({
      id,
      open,
      user_0: new User(
        mapJoin("user_0", ["id", "firstname", "lastname"], others)
      ),
      user_1: new User(
        mapJoin("user_1", ["id", "firstname", "lastname"], others)
      ),
    });
  }

  static async fromId(db: Client, conversationId: number) {
    const {
      rows: [conversation],
    } = await db.query(this.select(`/* SQL */ WHERE conversations.id = $1`), [
      conversationId,
    ]);
    if (!conversation) return null;
    return this.fromRow(conversation);
  }
}
