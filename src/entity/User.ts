import { Client } from "pg";
import { logger } from "../logger";
import { Serialize } from "../commons/serializer";
import { SerializeField } from "../commons/serializer/SerializeField";
import { IUser, IUserSession } from "../commons/types/user";
import { update } from "../utils/sql";
import { Conversation } from "./Conversation";

export class User implements IUser {
  @SerializeField({ groups: ["session", "full", "chat"] })
  id?: number;

  @SerializeField({ groups: ["session", "full", "chat"] })
  firstname!: string;

  @SerializeField({ groups: ["session", "full", "chat"] })
  lastname!: string;

  @SerializeField({ groups: ["never"] })
  password!: string;

  @SerializeField({ groups: ["session", "private", "full"] })
  email!: string;

  @SerializeField({ groups: ["full"] })
  activated!: boolean;

  @SerializeField({ groups: ["full"] })
  likes!: User[];

  constructor({ id, firstname, lastname, password, email, activated }: IUser) {
    this.id = id;
    this.firstname = firstname;
    this.lastname = lastname;
    this.password = password;
    this.email = email;
    this.activated = activated;
  }

  static async fromEmail(db: Client, email: string): Promise<User | null> {
    const {
      rows: [user],
    } = await db.query(`/* SQL */SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    if (!user) return null;
    return new User(user);
  }

  static async fromId(db: Client, id: number): Promise<User | null> {
    const {
      rows: [user],
    } = await db.query(`/* SQL */SELECT * FROM users WHERE id = $1`, [id]);
    if (!user) return null;
    return new User(user);
  }

  /**
   * Return all mached users from a user id
   * @param id user id
   */
  static async allMatched(db: Client, id: number): Promise<User[]> {
    const { rows: mached } = await db.query(
      `/* SQL */
        SELECT u.*
        FROM users_likes l
        INNER JOIN users u ON u.id = l."userId_1"
        WHERE l."userId_0" = $1
          and exists(SELECT 1
                    FROM users_likes l2
                    WHERE l2."userId_0" = l."userId_1"
                      AND l2."userId_1" = l."userId_0"
            )
      `,
      [id]
    );
    return mached.map((user) => new User(user));
  }

  static async conversations(db: Client, id: number): Promise<Conversation[]> {
    const { rows: conversations } = await db.query(
      Conversation.select(`/* SQL */ WHERE user_0 = $1 OR user_1 = $1`),
      [id]
    );
    return conversations.map((conversation) =>
      Conversation.fromRow(conversation)
    );
  }

  async hasMatch(db: Client, withUser: number): Promise<User | undefined> {
    if (!this.id) throw new Error("id is not set");
    const matched = await User.allMatched(db, this.id);
    return matched.find((matched) => matched.id === withUser);
  }

  /**
   * Return all the likes of the current user
   * @returns current user with likes set
   */
  async withLikes(db: Client): Promise<User> {
    const {
      rows: [likes],
    } = await db.query(
      `/* SQL */
        SELECT
          *
        FROM users_likes u
        INNER JOIN users l ON u.userId_1 = l.id
        WHERE u.userId_0 = $1
    `,
      [this.id]
    );
    this.likes = likes.map((like: IUser) => new User(like));
    return this;
  }

  async insert(db: Client): Promise<User> {
    const row = await db.query(
      `/* SQL */ INSERT INTO users (firstname, lastname, password, email, activated) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [this.firstname, this.lastname, this.password, this.email, this.activated]
    );
    this.id = row.rows[0].id;
    logger.debug(`inserted user ${this.toString()}`);
    return this;
  }

  async update(db: Client, value: Partial<User>): Promise<User> {
    await update(db, "users", value, { id: this.id });
    Object.assign(this, value);
    return this;
  }

  toSession(): IUserSession {
    return Serialize(this, ["session"]);
  }

  toString() {
    return `User(${this.id}, ${this.firstname}, ${this.lastname}, ${this.email}, ${this.activated})`;
  }
}
