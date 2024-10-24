// express.d.ts
import { IUser } from "./src/Entities/Userentities";

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Extend Request with IUser type
    }
  }
}
