import { ObjectId } from "mongoose";

export interface userPayload {
  id: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}
