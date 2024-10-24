import mongoose from "mongoose";

export interface Notification extends Document {
  sender: mongoose.Types.ObjectId;
  content: string;
  image: string;
  sendername:string;
  videos: string;
  isRead: boolean;
  chat: mongoose.Types.ObjectId;
  readBy: mongoose.Types.ObjectId[];
}
