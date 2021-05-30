import { Client } from "pg";
import { logger } from "../logger";
import { Serialize } from "../serializer";
import { SerializeField } from "../serializer/SerializeField";
import { IUser, IUserSession } from "../types/user";

export class User implements IUser {
  @SerializeField({ groups: ["session"] })
  id?: number;

  @SerializeField({ groups: ["session"] })
  firstname: string;

  lastname: string;

  password: string;

  email: string;

  constructor({ id, firstname, lastname, password, email }: IUser) {
    this.id = id;
    this.firstname = firstname;
    this.lastname = lastname;
    this.password = password;
    this.email = email;
  }

  static async fromEmail(db: Client, email: string): Promise<User[]> {
    const { rows: users } = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return users.map((user) => new User(user));
  }

  async insert(db: Client): Promise<User> {
    const row = await db.query(
      "INSERT INTO users (firstname, lastname, password, email) VALUES ($1, $2, $3, $4) RETURNING id",
      [this.firstname, this.lastname, this.password, this.email]
    );
    this.id = row.rows[0].id;
    logger.debug(`inserted user ${this.toString()}`);
    return this;
  }

  toSession(): IUserSession {
    return Serialize(this, ["session"]);
  }

  toString() {
    return `User(${this.id}, ${this.firstname}, ${this.lastname}, ${this.email})`;
  }

  // static async all(db: Client): Promise<User[]> {
  //   const { rows: users } = await db.query("SELECT * FROM users");
  //   return users.map(
  //     ({ username, password }) =>
  //       new User(username, password, new User("hey", "ho", null))
  //   );
  // }
}
