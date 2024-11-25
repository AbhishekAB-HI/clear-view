import mongoose, { Schema } from "mongoose";
import { IUser } from "../Entities/Userentities";

const FollowingSchema: Schema = new Schema(
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
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      required: false,
    },
    isAdmin: {
      type: Boolean,
      required: false,
    },
    lastSeen: {
      type: Date,
    },
    ReportUser: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "userdetail",
        },
        reportReason: {
          type: String,
        },
      },
    ],
    ReportPost: [
      {
        postId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "post",
        },
        postreportReason: {
          type: String,
        },
        userinfo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "userdetail",
        },
      },
    ],
    blocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userdetail",
      },
    ],
    blockedUser: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userdetail",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userdetail",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userdetail",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const FollowingSchemaData = mongoose.model<IUser>(
  "followSchema",
  FollowingSchema
);

export default FollowingSchemaData;
