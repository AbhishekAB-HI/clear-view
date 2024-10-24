import { ObjectId } from "mongoose";

export interface adminId extends Document {
  email: string;
  password: string;
}

export interface adminuserId extends Document {
  _id: ObjectId;
}

export interface passwords extends Document {
  password: string;
  harshpassword: string;
}

export interface Admintockens {
  admintocken: string;
}
