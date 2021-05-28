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
    const password = await hashPassword(firstname);

    const user = await new User({
      firstname,
      lastname,
      password,
      email: faker.internet.email(
        `${firstname.toLowerCase()}.${lastname.toLowerCase()}`
      ),
    }).insert(db);
    users.push(user);
  }

  return users;
}
