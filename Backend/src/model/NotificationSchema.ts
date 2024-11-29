import mongoose, { Schema } from "mongoose";
import { Notification } from "../entities/Notification";

const NotifiactSchema: Schema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userdetail",
    },
    content: { type: String, trim: true },
    sendername: { type: String },
    image: {
      type: [String],
      default: [],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    videos: {
      type: [String],
      default: [],
    },

    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "userdetail" }],
  },
  {
    timestamps: true,
  }
);

const NotifiactSchemaModal = mongoose.model<Notification>(
  "Notification",
  NotifiactSchema
);

export default NotifiactSchemaModal;
