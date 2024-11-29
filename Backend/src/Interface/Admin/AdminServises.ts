import { Posts } from "../../entities/Postentities";
import { IUser, ReportedPost } from "../../entities/userEntities";
import { adminId, Admintockens } from "../../Types/Servicetype/Admininterface";
import { ICounts } from "../../Types/Servicetype/PostInterface";
import { ParsedQs } from "qs";

export interface IAdminServices {
  verifyUser(userdata: Partial<adminId>): Promise<Admintockens | undefined>;
  deleteReportPost(id: string, postId: string): Promise<void>;
  deletePost(id: string): Promise<boolean | undefined>;
  getAllReportUsers(
    page: number,
    limit: number,
    search: string | unknown
  ): Promise<{ Reports: any[]; totalcount: number } | undefined>;
  getAllReportedpost(
    page: number,
    limit: number
  ): Promise<{ posts: ReportedPost[] | any; total: number }>;
  getAllpost(
    page: number,
    limit: number,
    search: string | unknown
  ): Promise<{ posts: Posts[]; total: number }>;
  getpostAnduserdetails(): Promise<ICounts | undefined>;
  getUserdetails(
    page: number,
    limit: number,
    search: string | string[] | ParsedQs | ParsedQs[] | undefined
  ): Promise<{ userinfo: IUser[]; userscount: number } | undefined>;
  updateBlocking(
    userid: string,
    isActive: boolean
  ): Promise<boolean | undefined>;
}
