import mongoose, { Schema } from "mongoose";
import { Message } from "../entities/MessageEntities";

const messageSchema: Schema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userdetail",
    },
    content: { type: String, trim: true },
    image: {
      type: [String],
      default: [],
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

const messageSchemaModel = mongoose.model<Message>("Message", messageSchema);

export default messageSchemaModel;
