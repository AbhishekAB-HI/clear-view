import { Posts } from "../../Entities/Postentities";
import { IUser, ReportedPost } from "../../Entities/Userentities";
import { ICounts, Ipostcount, RecentPosts } from "../../Types/Servicetype/PostInterface";
import { ParsedQs } from "qs";




export interface IAdminReposityory {
  findAdminbyemail(email: string): Promise<IUser | null>;
  findAllReportUsers(
    page: number,
    limit: number,
    search: string | unknown
  ): Promise<IUser[] | undefined>;
  findPost(
    page: number,
    limit: number,
    search: string | unknown
  ): Promise<{ posts: Posts[] }>;
  deleteReportedPost(id: string): Promise<void>;
  findallpostanduser(): Promise<any[] | unknown>;
  getTotalUsers(): Promise<number>;
  getTotalPosts(): Promise<number>;
  findUsers(
    page: number,
    limit: number,
    search: string | string[] | ParsedQs | ParsedQs[] | undefined
  ): Promise<{ userinfo: IUser[] }>;
  ModifyUsersblock(
    userid: string,
    isActive: boolean
  ): Promise<boolean | undefined>;
  checkUserBlockStatus(
    userid: string,
    isActive: boolean
  ): Promise<boolean | undefined>;
  checkPostStatus(id: string): Promise<boolean | undefined>;
  deletePost(
    id: string,
    isblock: boolean | undefined
  ): Promise<boolean | undefined>;
  getUsersCount(): Promise<{ userscount: number | undefined }>;
  countAllPost(search: string | unknown): Promise<number | undefined>;
  getTotalReportedPostUsers(): Promise<number | undefined>;
  findReportPost(page: number, limit: number): Promise<IUser[]>;
  findTotalReportUsers(): Promise<number | undefined>;
   findThePostToDelete(id: string): Promise<{ images: string[]; videos: string[] }>
   deletePostFromUsers(postId:string):Promise<void>
}
