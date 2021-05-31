import { Client } from "pg";
import { User } from "../entity/User";
import { hashPassword } from "../utils/password";

export async function generateUsers(
  faker: Faker.FakerStatic,
  db: Client,
  amount: number
): Promise<User[]> {
  const users = [];

  for (let i = 0; i < amount; i += 1) {
    const firstname = faker.name.firstName();
    const lastname = faker.name.lastName();
    const password = await hashPassword(`0${firstname}Password`);
    const email = faker.internet.email(
      `${firstname.toLowerCase()}.${lastname.toLowerCase()}`
    );

    const user = await new User({
      firstname,
      lastname,
      password,
      email,
      activated: true,
    }).insert(db);
    users.push(user);
  }

  return users;
}
