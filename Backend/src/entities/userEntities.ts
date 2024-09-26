import mongoose from "mongoose";
import { ObjectId } from "mongoose";
import { Document, Types } from "mongoose";


export interface Checkuser extends Document {
  email: string;
  password: string;
}

export interface Confirmuser extends Document {
  email: string;
}

export interface tockens {
  accessToken: string;
  refreshToken:string;
}


export interface Posts {
  _id: ObjectId;
  user: ObjectId;
  description: string;
  image: string;
  videos: string;
  Reportpost:Boolean
}



export interface Chats {
  _id: any;
  chatName: string;
  isGroupchat: boolean;
  users: IUser[];
  latestMessage: Message;
  groupAdmin: IUser[];
}

export interface Message extends Document {
  sender: mongoose.Types.ObjectId;
  content: string;
  image: string;
  videos: string;
  chat: mongoose.Types.ObjectId;
  readBy: mongoose.Types.ObjectId[];
}



export interface Postsget {
  user: ObjectId;
  description: string;
  image: string[];
  videos: string[];
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
  image?:string
}


export interface IUserReturn extends Document {
  id: ObjectId;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  otp?: number;
}




