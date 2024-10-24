import mongoose, { Schema } from "mongoose";
import { IUserReturn } from "../Entities/Userentities";

const UserTempSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    otp: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

UserTempSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 });

const UserTempSchemadata = mongoose.model<IUserReturn>(
  "userModel",
  UserTempSchema
);

export default UserTempSchemadata;
