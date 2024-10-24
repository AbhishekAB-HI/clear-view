

import mongoose from "mongoose";


export interface Message extends Document {
  sender: mongoose.Types.ObjectId;
  content: string;
  image: string;
  videos: string;
  chat: mongoose.Types.ObjectId;
  readBy: mongoose.Types.ObjectId[];
}
