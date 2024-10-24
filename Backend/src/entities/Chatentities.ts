import mongoose from "mongoose";
import { ObjectId } from "mongoose";
import { Document, Types } from "mongoose";

export interface Chats {
  _id: ObjectId;
  chatName: string;
  isGroupchat: boolean;
  users: IUser[];
  latestMessage: Message;
  groupAdmin: IUser[];
}

//  export interface Igroup {
//    groupname: string;
//    users: Types.ObjectId;
//  }

export interface Message extends Document {
  sender: mongoose.Types.ObjectId;
  content: string;
  image: string;
  videos: string;
  chat: mongoose.Types.ObjectId;
  readBy: mongoose.Types.ObjectId[];
}

export interface IUser extends Document {
  id: ObjectId;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  isAdmin: boolean;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  image?: string;
  followers: IUser[];
  following: IUser[];
  blockedUser: IUser[];
  ReportUser: IReportUser[];
}


export interface IReportUser {
  userId: Types.ObjectId;
  reportReason: string;
}
