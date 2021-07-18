import { Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../index";

export function createToken<T>(data: T, secret: string = JWT_SECRET) {
  return jwt.sign({ data }, secret, { expiresIn: "15m" });
}

export function verifyToken(token: string, secret: string = JWT_SECRET): any {
  try {
    return jwt.verify(token, secret);
  } catch (e) {
    return null;
  }
}

export function setAuthHeaders(res: Response, token: string) {
  res.setHeader("Authorization", `Bearer ${token}`);
}
