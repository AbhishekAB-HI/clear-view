import mongoose, { Schema } from "mongoose";
import { Posts } from "../Entities/Postentities";

const postSchemaNotifications: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userdetail",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    text: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    BlockPost: {
      type: Boolean,
      default: false,
    },
    LikeStatement: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userdetail",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "userdetail",
        },
        parentComment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "post.comments",
        },

        content: {
          type: String,
          required: true,
        },
        userName: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reportPost: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const newspostSchemadataNotifications = mongoose.model<Posts>(
  "postnotify",
  postSchemaNotifications
);

export default newspostSchemadataNotifications;
