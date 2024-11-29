import mongoose from "mongoose";
import { Posts } from "../../Entities/Postentities";
import { Checkuser, Confirmuser, IUser, tockens } from "../../Entities/Userentities";
import { IAllNotification } from "../../Entities/Notificationentitities";
import { TokenResponce } from "../../Types/Servicetype/UserInterface";



export interface IUserServices {

  createUser(userData: Partial<IUser>): Promise<IUser | undefined>;
  getUserInfoses(userId: unknown): Promise<IUser | undefined>;
  updateLastseen(userId: unknown): Promise<IUser | unknown>;
  verifyUser(userdata: Partial<Checkuser>): Promise<tockens | undefined>;
  verifymail(userdata: string): Promise<Confirmuser | undefined | null>;
  verifyotp(otp: number, email: string): Promise<Checkuser | undefined | null>;
  replyComments(commentId: string,replymessage: string, postId: string,userId: string, username: string): Promise<Posts>;
  getAllReplyhere(): Promise<Posts[]>;
  sendReportReason(userId: string,text: string,logeduserId: string | unknown): Promise<void>;
  passProfileid( userId: unknown, page: number, limit: number ): Promise<| {userinfo: IUser | null;postinfo: Posts[] | null;totalpost: number | undefined;}| undefined>;
  findBlockedUsers(userId: unknown,page: number,limit: number): Promise<{ Allusers: IUser[]; totalblockuser: number } | undefined>;
  passLikePostID(postId: string,userId: mongoose.Types.ObjectId): Promise<IAllNotification | unknown>;
  passCommentPostID(postId: string,userId: mongoose.Types.ObjectId,comment: string): Promise<Posts | null>;
  passPostID(postId: string,text: string,userId: string): Promise<IUser | null>;
  Changepassword(email: string, password: string): Promise<IUser>;
  CheckOtp(userotp: number, email: string): Promise<TokenResponce | undefined>;
  sendResendotp(email: string): Promise<void>;
  userIDget(userId: unknown): Promise<IUser | undefined>;
  getUserInfomations(userId: unknown): Promise<IUser | undefined>;
  getpostdetails(search: string | string[] | any | any[],category: string | string[] | any | any[], page: string | number): Promise<{posts: Posts[];currentPage: string | number;totalPages: number;}>;
  findSearchedusers(search: unknown,userId: unknown): Promise<IUser[] | undefined>;
  sendPostid(postId: string): Promise<void>;
  postuserIDget(userId: unknown,page: number,limit: number): Promise<{ posts: Posts[]; total: number } | undefined>;
  editDetailsdata(content: string,postId: string,imageFiles: string[],videoFiles: string[]): Promise<Posts | undefined>;
  postDetailsdata(userId: string,content: string,Category: string,imageFiles: string[],videoFiles: string[]): Promise<{savePosts: Posts | undefined;postNotify: IAllNotification | undefined;}>;
  PassUserDetails(userId: string, password: string,newpassword: string): Promise<void>;
  userDetailsdata(name: string,image: string,userid: string): Promise<IUser | undefined>;
  
}