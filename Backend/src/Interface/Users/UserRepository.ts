import mongoose from "mongoose";
import { Posts } from "../../entities/Postentities";
import { IUser, IUserReturn } from "../../entities/userEntities";
import { IAllNotification } from "../../entities/Notificationentitities";

export interface IUserRepository {
  userRegister(userData: Partial<IUser>): Promise<IUserReturn | undefined>;
  findlastseenupdate(userId: unknown): Promise<IUser | unknown>;
  findUserInfo(userId: unknown): Promise<IUser | undefined>;
  verifyresend(email: string): Promise<IUserReturn | undefined>;
  findotp(otp: number, email: string): Promise<IUser | undefined>;
  findByEmail(email: string): Promise<IUser | null>;
  checkByEmail(userdata: any): Promise<IUser | undefined>;
  updateTime(email: string): Promise<void>;
  checkByisActive(email: string): Promise<void>;
  checkingforgetotp(otp: number, email: string): Promise<IUser | undefined>;
  commentthePost(
    postId: string,
    userId: mongoose.Types.ObjectId,
    comment: string
  ): Promise<Posts | null>;
  replythecomment(
    commentId: string,
    replymessage: string,
    postId: string,
    userId: string,
    username: string
  ): Promise<Posts | null>;
  passProfileId(
    userId: unknown,
    page: number,
    limit: number
  ): Promise<
    | {
        userinfo: IUser | null;
        postinfo: Posts[] | null;
        totalpost: number | undefined;
      }
    | undefined
  >;
  sendTheReportReason(
    userID: string,
    text: string,
    logeduserId: string | unknown
  ): Promise<void>;
  findAllReply(): Promise<Posts[]>;
  LikethePost(
    postId: string,
    userId: mongoose.Types.ObjectId
  ): Promise<IAllNotification | unknown>;
  findBlockedUserinRepo(
    userId: unknown,
    page: number,
    limit: number
  ): Promise<{ Allusers: IUser[]; totalblockuser: number } | undefined>;
  RepostPost(
    postid: string,
    text: string,
    userId: string
  ): Promise<IUser | undefined>;
  changingpassword(email: string, password: string): Promise<IUser | null>;
  FindEmail(email: string | undefined): Promise<IUser | undefined | null>;
  checkingmail(email: string | undefined): Promise<IUser | undefined | null>;
  getUserProfile(userId: unknown): Promise<IUser | undefined | null>;
  getTheUser(userId: unknown): Promise<IUser | undefined>;
  getAllthedata(
    search: string,
    category: string,
    page: string | number
  ): Promise<{
    posts: Posts[];
    currentPage: string | number;
    totalPages: number;
  }>;
  getAlltheUsers(
    searchId: unknown,
    userId: unknown
  ): Promise<IUser[] | undefined>;
  postidreceived(postId: string): Promise<void>;
  getPostUserData(
    userId: unknown,
    page: number,
    limit: number
  ): Promise<{ posts: Posts[]; total: number } | undefined>;
  findeditpostdetails(
    postId: string,
    content: string,
    imageFiles: string[],
    videoFiles: string[]
  ): Promise<Posts | undefined>;
  findUserdetails(
    userId: string,
    content: string,
    Category: string,
    imageFiles: string[],
    videoFiles: string[]
  ): Promise<{
    savePosts: Posts | undefined;
    postNotify: IAllNotification | undefined;
  }>;
  findUserData(userId: string): Promise<IUser | undefined>;
  updateUserpassword(
    userId: string,
    newpassword: string
  ): Promise<IUser | undefined>;
  updateUserProfile(
    name: string,
    image: string,
    userid: string
  ): Promise<IUser | undefined>;
}
