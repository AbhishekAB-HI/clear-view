// express.d.ts
import { IUser } from "./src/entities/userEntities";

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Extend Request with IUser type
    }
  }
}
