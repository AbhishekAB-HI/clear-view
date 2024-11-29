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
  refreshToken: string;
}

export interface IReportUser {
  userId: string;
  reportReason: string;
  Reportedby: string;
  userimage: string | undefined;
  username: string | undefined;
}

export interface IReportpost {
  _id?: Types.ObjectId;
  postId: Types.ObjectId;
  postreportReason: string;
  userinfo: Types.ObjectId;
  postcontent: string | undefined;
  postimage: [String] | string;
  postVideo: [String] | string;
  postedBy: string | undefined;
  reportedBy: string | undefined;
}

export interface ReportedPost {
  reporter: { _id: string; name: string };
  postId: mongoose.Types.ObjectId;
  reportReason: string;
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
  lastSeen: Date;
  image?: string;
  followers: IUser[];
  following: IUser[];
  blockedUser: IUser[];
  blocked: IUser[];
  ReportUser?: IReportUser[];
  ReportPost?: IReportpost[];
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
  lastSeen: Date;
  otp?: number;
  followers: IUser[];
  following: IUser[];
  blockedUser: IUser[];
  blocked: IUser[];
  ReportUser: IReportUser[];
  ReportPost?: IReportpost[];
}
