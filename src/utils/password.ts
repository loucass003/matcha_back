import argon2 from "argon2";

export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { timeCost: 2, parallelism: 2 });
}

export function verifyPassword(
  hashed_password: string,
  password: string
): Promise<boolean> {
  return argon2.verify(hashed_password, password);
}
