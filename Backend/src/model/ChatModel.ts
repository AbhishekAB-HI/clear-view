import mongoose, { Schema } from "mongoose";
import { Chats } from "../entities/userEntities";

const ChatModel: Schema = new Schema(
  {
    chatName: { type: String, trim: true },
    isGroupchat: { type: Boolean, default: false },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userdetail",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "userdetail" },
  },
  {
    timestamps: true,
  }
);

const ChatSchemamodel = mongoose.model<Chats>("Chat", ChatModel);

export default ChatSchemamodel;




















