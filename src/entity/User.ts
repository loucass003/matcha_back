import { Client } from "pg";
import { logger } from "../logger";
import { Serialize } from "../commons/serializer";
import { SerializeField } from "../commons/serializer/SerializeField";
import { IUser, IUserSession } from "../commons/types/user";
import { update } from "../utils/sql";
import { Entity } from "../sql/decorators/Entity";
import { Column } from "../sql/decorators/Column";
import { ManyToMany } from "../sql/decorators/ManyToMany";

@Entity({ tableName: "users" })
export class User implements IUser {
  @SerializeField({ groups: ["session"] })
  @Column()
  id!: number;

  @SerializeField({ groups: ["session"] })
  @Column()
  firstname!: string;

  @SerializeField()
  @Column()
  lastname!: string;

  @SerializeField()
  @Column()
  password!: string;

  @SerializeField()
  @Column()
  email!: string;

  @SerializeField()
  @Column()
  activated!: boolean;

  @SerializeField()
  @ManyToMany(User)
  @Column()
  likes!: User[];

  constructor({ id, firstname, lastname, password, email, activated }: IUser) {
    this.id = id || -1;
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
