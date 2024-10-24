import mongoose from "mongoose";
import { ObjectId } from "mongoose";
import { Document, Types } from "mongoose";

export interface Posts {
  _id: ObjectId;
  user: ObjectId;
  description: string;
  image: string;
  videos: string;
  reportPost: Boolean;
  text: string;
  likes: Types.ObjectId[];
  comments: Comments[];
  likeCount: number;
  LikeStatement: boolean;
  userName: string;
  BlockPost:boolean;
}


export interface Comments {
  _id: ObjectId;
  user: ObjectId;
  parentComment?: ObjectId;
  content: string;
}

export interface Postsget {
  user: ObjectId;
  description: string;
  image: string[];
  videos: string[];
}
