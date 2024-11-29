import mongoose from "mongoose";
import { Chats, FormattedChat } from "../../Entities/Chatentities";
import { IAllNotification, IFollowNotification } from "../../Entities/Notificationentitities";
import { Posts } from "../../Entities/Postentities";
import { IUser } from "../../Entities/Userentities";






export interface IChatRepository {
    
  // findAccessgroupchat(chatId: string): Promise<Chats | null>;
  createNewGroup( groupname: string, userLists: IUser[], userId: unknown): Promise<Chats | undefined | null>;
  findAllchats(userId: string | unknown): Promise<IUser[] | undefined>;
  getUserdetails(userId: unknown): Promise<IUser | unknown>;
  getUserIdHere(userId: string | unknown): Promise<boolean | undefined>;
  addrepFollowers(userId: string, loggedUserId: string): Promise<{followingUser: IAllNotification | any;isAlreadyFollowing: boolean | unknown; Userinfo: IUser | unknown;}>;
  findAllPostNotifications(postid: unknown): Promise<Posts | null | undefined>;
  findAllfollowNotifications(userId: unknown | mongoose.Types.ObjectId,value: boolean | unknown,followid: any): Promise<IFollowNotification | unknown>;
  findAllNotifications(userId: unknown): Promise<Notification[] | unknown>
  FindAllUsers(userId: unknown): Promise<IUser[] | null | undefined>;
  getAllNotifications(userId: any): Promise<{followNotifications: any[];postNotifications: any[];likeNotifications: any[];}>;
  findAllFollowers(userId: string | unknown,page: number,limit: number): Promise<{ users: IUser[]; totalfollowers: number } | undefined>;
  findAllOtherusers(userId: string | unknown,page: number,limit: number): Promise<{ Allusers: IUser[] | undefined; totalusers: number } | undefined>;
  findOtherMessages(userId: string | unknown,page: number,limit: number): Promise<| {foundUsers: IUser[];formattedChats: FormattedChat[];formatgroupchats: FormattedChat[]; totalDirectChats: number; totalGroupChats: number;}| undefined >;
  findAllUsersFound(userId: unknown): Promise<IUser[] | undefined>;
  findgroupChats(userId: unknown,page: number,limit: number): Promise<{ groupChats: Chats[]; totalGroupChats: number } | undefined>;
  // findOtherusers( userId: string | unknown,  page: number,  limit: number): Promise<{ followusers: IUser[]; totalfollow: number } | undefined>;
findChatById(chatId: string): Promise<Chats | null> 
createChat(chatData: Partial<Chats>): Promise<Chats>
deleteNotificationsByChat(chatId: string): Promise<void>
populateLatestMessage(chat: Chats[]): Promise<Chats[]> 
findExistingChat(userId: string, chatId: string): Promise<Chats[]>
findTheChatHere(chatId: string): Promise<Chats | null>
findAndPopulateChat(chatinfo: Chats): Promise<Chats | null> 
findcurrentuser(userId: string): Promise<{ blockedUsers: IUser[]; totalfollowing: number } | null>
findFollowingUsers(userId: string | unknown,page: number,limit: number): Promise<IUser[] | null>
findthelogedusers(userId: string): Promise<{ blockedUsers: IUser[]; totalfollower: number } | null> 
findFollowersUsers(userId: string | unknown,page: number,limit: number): Promise<IUser[] | null>
}