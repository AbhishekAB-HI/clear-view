import { Chats, FormattedChat } from "../../entities/Chatentities";
import {
  IAllNotification,
  IFollowNotification,
} from "../../entities/Notificationentitities";
import { Posts } from "../../entities/Postentities";
import { IUser } from "../../entities/userEntities";

export interface IChatServices {
  getAccessgroupChat(chatId: string): Promise<Chats | unknown>;
  getAccessChat(
    userId: string | unknown,
    chatId: string
  ): Promise<Chats | unknown>;
  Findlogeduserdetails(userId: string | unknown): Promise<IUser | unknown>;
  getUserBlockStatus(userId: string | unknown): Promise<boolean | undefined>;
  AddToFollowers(
    userId: string,
    LoguserId: string
  ): Promise<{
    followingUser: IAllNotification | unknown;
    isAlreadyFollowing: boolean | unknown;
    Userinfo: IUser | unknown;
  }>;
  getAllChats(userId: string | unknown): Promise<IUser[] | undefined>;
  getNewGroup(
    groupName: string,
    userlist: IUser[],
    userId: unknown
  ): Promise<Chats | undefined>;
  getAllpostNotifications(postid: unknown): Promise<Posts | unknown>;
  getAllfollowNotifications(
    userId: unknown,
    Value: boolean | unknown,
    followid: unknown
  ): Promise<IFollowNotification | unknown>;
  searchAllNotifications(userId: unknown): Promise<Notification[] | unknown>;
  getUserforGroup(userId: unknown): Promise<IUser[] | undefined>;
  findAllNotifications(userId: unknown): Promise<{
    followNotifications: any[];
    postNotifications: any[];
    likeNotifications: any[];
  }>;
  getAllFollowers(
    userId: string | unknown,
    page: number,
    limit: number
  ): Promise<{ users: IUser[]; totalfollowers: number } | undefined>;
  findAllGetUsers(
    userId: string | unknown,
    page: number,
    limit: number
  ): Promise<{ Allusers: IUser[] | undefined; totalusers: number } | undefined>;
  getOthermessage(
    userId: string | unknown,
    page: number,
    limit: number
  ): Promise<
    | {
        foundUsers: IUser[];
        formattedChats: FormattedChat[];
        formatgroupchats: FormattedChat[];
        totalDirectChats: number;
        totalGroupChats: number;
      }
    | undefined
  >;
  findAllUsers(userId: unknown): Promise<IUser[] | undefined>;
  getAllChatsHere(
    userId: unknown,
    page: number,
    limit: number
  ): Promise<{ groupChats: Chats[]; totalGroupChats: number } | undefined>;
  getOtherusers(
    userId: string | unknown,
    page: number,
    limit: number
  ): Promise<{ followusers: IUser[]; totalfollow: number } | undefined>;
}
