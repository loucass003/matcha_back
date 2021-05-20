import { Client } from 'pg';
import { SerializeField } from '../serializer/SerializeField';
import { str } from '../validation';

export class User {
  @SerializeField({ groups: ['public'] })
  username: string;

  @SerializeField({ groups: ['private'] })
  password: string;

  @SerializeField({ groups: ['public'] })
  friend: User[] | null;

  @SerializeField<string, string>({ groups: ['public'], format: str.upper() })
  adadad: string;

  constructor(username: string, password: string, friend: User | null) {
    this.username = username;
    this.password = password;
    this.friend = friend ? [friend, friend, friend] : null;
    this.adadad = 'adadad';
  }

  static async all(db: Client): Promise<User[]> {
    const { rows: users } = await db.query('SELECT * FROM users');
    return users.map(
      ({ username, password }) => new User(username, password, new User('hey', 'ho', null)),
    );
  }
}
