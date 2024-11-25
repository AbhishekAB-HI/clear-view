import mongoose, { ObjectId } from "mongoose";

export interface TokenResponce {
  accessToken: string;
  refreshToken: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserVerify {
  email: string;
  otp: string;
}

export interface ICounts {
  totalUsers: number;
  totalPosts: number;
  recentPosts: Ipostcount[];
}

export interface Ipostcount {
  description: string;
  likeCount: number;
  totalLikes: number;
  totalComments: number;
}

export interface ActiveUsersType {
  userId: string;
  socketId: string;
}

export interface NewMessage {
  chat: {
    users: string[];
  };
  sender: {
    _id: string;
  };
}

export interface IFollowNotification {
  userId: unknown;
  userName: string;
  image: string;
  email: string;
  followuserId: unknown;
  timestamps: Date;
}

export interface IPostNotification {
  userId: unknown;
  postusername: string;
  image: ObjectId;
  content: string;
  email: string;
  followuserId: unknown;
  timestamps: Date;
}

export interface IAllNotification {
  Follownotifications: IFollowNotification[];
  PostNotifications: IPostNotification[];
  LikeNotifications: ILikeNotifications[];
  createdAt?: Date;
  updatedAt?: Date;

}

export interface ILikeNotifications {
  postId: unknown;
  postuserId: unknown;
  likedusername: string;
  postcontent: string;
  userimage: string;
  postimage: string;
  email: string;
  likeduserId: unknown;
  likedstatus: unknown;
  timestamps: Date;
}

export interface MulterRequest extends Request {
  file: Express.Multer.File;
}
