import { Client } from "pg";
import { IConversation } from "../commons/types/conversation";
import { IUser } from "../commons/types/user";
import { mapJoin, selectJoin } from "../utils/sql";
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
    } = await db.query(this.select(`/* SQL */ WHERE id = $1`), [
      conversationId,
    ]);
    if (!conversation) return null;
    return this.fromRow(conversation);
  }
}
