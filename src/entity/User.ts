import { Client } from "pg";
import { logger } from "../logger";
import { Serialize } from "../commons/serializer";
import { SerializeField } from "../commons/serializer/SerializeField";
import { IUser, IUserSession } from "../commons/types/user";
import { update } from "../utils/sql";

export class User implements IUser {
  @SerializeField({ groups: ["session"] })
  id?: number;

  @SerializeField({ groups: ["session"] })
  firstname: string;

  @SerializeField()
  lastname: string;

  @SerializeField()
  password: string;

  @SerializeField()
  email: string;

  @SerializeField()
  activated: boolean;

  @SerializeField()
  activationToken?: string;

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
    } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (!user) return null;
    return new User(user);
  }

  static async fromId(db: Client, id: number): Promise<User | null> {
    const {
      rows: [user],
    } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    if (!user) return null;
    return new User(user);
  }

  async insert(db: Client): Promise<User> {
    const row = await db.query(
      "INSERT INTO users (firstname, lastname, password, email, activated) VALUES ($1, $2, $3, $4, $5) RETURNING id",
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
