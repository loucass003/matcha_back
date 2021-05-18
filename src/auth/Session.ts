export class Session {
  username: string;

  constructor({ username }: { username: string }) {
    this.username = username;
  }
}
