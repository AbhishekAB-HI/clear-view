// src/express.d.ts

import { userPayload } from "./entities/UserTypes"; // Adjust to the correct path

declare global {
  namespace Express {
    interface Request {
      userdata?: userPayload;
    }
  }
}
