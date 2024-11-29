import mongoose, { Schema } from "mongoose";
import { IUser } from "../entities/userEntities";

const UserSchema: Schema = new Schema(
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
        Reportedby: {
          type: String,
        },
        username: {
          type: String,
        },
        userimage: {
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
        postcontent: {
          type: String,
        },
        postimage: {
          type: String,
        },
        postVideo: {
          type: String,
        },
        userinfo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "userdetail",
        },
        postedBy: {
          type: String,
        },
        reportedBy: {
          type: String,
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

const UserSchemadata = mongoose.model<IUser>("userdetail", UserSchema);

export default UserSchemadata;
