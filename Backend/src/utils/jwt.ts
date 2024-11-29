import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { adminPayload, userPayload } from "../Types/Commontype/TockenInterface";

dotenv.config();

const accessTokenSecret = process.env.ACCESS_TOKEN_PRIVATE_KEY as string;
const refreshTokenSecret = process.env.REFRESH_TOKEN_PRIVATE_KEY as string;
const adminaccessTokenSecret = process.env.ADMIN_TOKEN_PRIVATE_KEY as string;

export const generateAccessToken = (user: userPayload) => {
  return jwt.sign(user, accessTokenSecret, { expiresIn: "7h" });
};

export const generateRefreshToken = (user: userPayload) => {
  return jwt.sign(user, refreshTokenSecret, { expiresIn: "7d" });
};

export const generateAdminAccessToken = (user: adminPayload) => {
  return jwt.sign(user, adminaccessTokenSecret, { expiresIn: "7h" });
};


export const generateAdminRefreshToken = (user: adminPayload) => {
  return jwt.sign(user, adminaccessTokenSecret, { expiresIn: "7h" });
};