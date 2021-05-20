import { Client } from 'pg';
import { SerializeField } from '../serializer/SerializeField';

export class User {
  @SerializeField({ groups: ['public'] })
  username: string;

  @SerializeField({ groups: ['private'] })
  password: string;

  @SerializeField({ groups: ['public'] })
  friend: User | null;

  adadad: string;

  constructor(username: string, password: string, friend: User | null) {
    this.username = username;
    this.password = password;
    this.friend = friend;
    this.adadad = 'adadad';
  }

  static async all(db: Client) {
    const { rows: users } = await db.query('SELECT * FROM users');
    return users.map(
      ({ username, password }) => new User(username, password, null),
    );
  }
}
