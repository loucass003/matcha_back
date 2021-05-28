import { Client } from "pg";
import { IUser } from "../types/user";

export class User implements IUser {
  id?: number;

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

  async insert(db: Client): Promise<User> {
    if (this.id) {
      await db.query(
        "INSERT INTO users (id, firstname, lastname, password, email) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [this.id, this.firstname, this.lastname, this.password, this.email]
      );
    } else {
      const row = await db.query(
        "INSERT INTO users (firstname, lastname, password, email) VALUES ($1, $2, $3, $4) RETURNING id",
        [this.firstname, this.lastname, this.password, this.email]
      );
      this.id = row.rows[0].id;
    }
    return this;
  }

  // static async all(db: Client): Promise<User[]> {
  //   const { rows: users } = await db.query("SELECT * FROM users");
  //   return users.map(
  //     ({ username, password }) =>
  //       new User(username, password, new User("hey", "ho", null))
  //   );
  // }
}
