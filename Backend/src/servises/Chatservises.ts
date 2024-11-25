import { promises } from "dns";
import { IUser } from "../Entities/Userentities";
import { Chats, FormattedChat } from "../Entities/Chatentities";
import chatRepository from "../Repository/Chatrepository";
import { Notification } from "../Entities/Notification";
import { error } from "console";
import { Types } from "mongoose";
import { Posts } from "../Entities/Postentities";
import {
  IAllNotification,
  IFollowNotification,
} from "../Interface/userInterface/Userdetail";

class ChatServices {
  constructor(private chatRepository: chatRepository) {}

  // async SendGroupId(
  //   userId: string | unknown,
  //   chatId: string
  // ): Promise<Chats | unknown> {
  //   try {
  //     const chatRepository = await this.chatRepository.findGroupchat(
  //       userId,
  //       chatId
  //     );
  //     if (!chatRepository) {
  //       throw new Error("Cannot find the chatschema");
  //     }
  //     return chatRepository;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  async getAccessgroupChat(chatId: string): Promise<Chats | unknown> {
    try {
      const chatRepository = await this.chatRepository.findAccessgroupchat(
        chatId
      );
      if (!chatRepository) {
        throw new Error("Cannot find the chatschema");
      }
      return chatRepository;
    } catch (error) {
      console.log(error);
    }
  }

  async getAccessChat(
    userId: string | unknown,
    chatId: string
  ): Promise<Chats | unknown> {
    try {
      const chatRepository = await this.chatRepository.findAccesschat(
        userId,
        chatId
      );
      if (!chatRepository) {
        throw new Error("Cannot find the chatschema");
      }
      return chatRepository;
    } catch (error) {
      console.log(error);
    }
  }

  async Findlogeduserdetails(
    userId: string | unknown
  ): Promise<IUser | unknown> {
    try {
      const getuserinfo = await this.chatRepository.getUserdetails(userId);
      if (!getuserinfo) {
        throw new Error("No user found");
      }
      return getuserinfo;
    } catch (error) {
      console.log(error);
    }
  }

  async getUserStatus(userId: string | unknown) {
    try {
      const getStatus = await this.chatRepository.getUserIdstatus(userId);
    } catch (error) {
      console.log(error);
    }
  }

  async getUserBlockStatus(
    userId: string | unknown
  ): Promise<boolean | undefined> {
    try {
      const getStatus = await this.chatRepository.getUserIdHere(userId);

      return getStatus;
    } catch (error) {
      console.log(error);
    }
  }

  async AddToFollowers(
    userId: string,
    LoguserId: string
  ): Promise<{
    followingUser: IAllNotification | unknown;
    isAlreadyFollowing: boolean | unknown;
    Userinfo: IUser | unknown;
  }> {
    const addedFollower = await this.chatRepository.addrepFollowers(
      userId,
      LoguserId
    );

    const { followingUser, isAlreadyFollowing, Userinfo } = addedFollower;

    return { followingUser, isAlreadyFollowing, Userinfo };
  }
  async getAllChats(userId: string | unknown): Promise<IUser[] | undefined> {
    const chatrecivefromRepo = await this.chatRepository.findAllchats(userId);
    if (!chatrecivefromRepo) {
      throw new Error("no chat get");
    }
    return chatrecivefromRepo;
  }

  async getNewGroup(
    groupName: string,
    userlist: IUser[],
    userId: unknown
  ): Promise<Chats | undefined> {
    try {
      const userFind = await this.chatRepository.createNewGroup(
        groupName,
        userlist,
        userId
      );

      if (!userFind) {
        throw new Error("Chat is  not created yet");
      }
      return userFind;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllpostNotifications(postid: unknown): Promise<Posts | unknown> {
    try {
      const data = await this.chatRepository.findAllPostNotifications(postid);
      if (!data) {
        throw new Error("No post get");
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllfollowNotifications(
    userId: unknown,
    Value: boolean | unknown,
    followid: unknown
  ): Promise<IFollowNotification | unknown> {
    try {
      const data = await this.chatRepository.findAllfollowNotifications(
        userId,
        Value,
        followid
      );
      if (!data) {
        throw new Error("No users get");
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllNotifications(
    userId: unknown
  ): Promise<Notification[] | undefined> {
    try {
      const data = await this.chatRepository.findAllNotifications(userId);
      if (!data) {
        throw new Error("No notifications get");
      }
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async getUserforGroup(userId: unknown): Promise<IUser[] | undefined> {
    try {
      const getAllusers = await this.chatRepository.FindAllUsers(userId);
      if (!getAllusers) {
        throw new Error("No user is found");
      }
      return getAllusers;
    } catch (error) {
      console.log(error);
    }
  }

  async findAllNotifications(userId: unknown): Promise<{
    followNotifications: any[];
    postNotifications: any[];
    likeNotifications: any[];
  }> {
    const foundUser = await this.chatRepository.getAllNotifications(userId);

    const { followNotifications, postNotifications, likeNotifications } =
      foundUser;

    return { followNotifications, postNotifications, likeNotifications };
  }

  async getAllFollowers(
    userId: string | unknown,
    page: number,
    limit: number
  ): Promise<{ users: IUser[]; totalfollowers: number } | undefined> {

    const foundUser = await this.chatRepository.findAllFollowers(userId,page,limit)

    if (!foundUser?.totalfollowers || !foundUser?.users) {
      return {
        users: [],
        totalfollowers: 0,
      };
    }

    const { totalfollowers, users } = foundUser 

    return { totalfollowers, users };
  }

  async findAllGetUsers(
    userId: string | unknown,
    page: number,
    limit: number
  ): Promise<
    { Allusers: IUser[] | undefined; totalusers: number } | undefined
  > {
    try {
      const getAllusershere = await this.chatRepository.findAllOtherusers(
        userId,
        page,
        limit
      );

      if (!getAllusershere?.Allusers || !getAllusershere.totalusers) {
        return {
          Allusers: [],
          totalusers: 0,
        };
      }
      const { Allusers, totalusers } = getAllusershere;

      return {
        Allusers,
        totalusers,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getOthermessage(
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
  > {
    try {
      const getAllusershere = await this.chatRepository.findOtherMessages(
        userId,
        page,
        limit
      );

      if (
        !getAllusershere?.formattedChats ||
        !getAllusershere.foundUsers ||
        !getAllusershere.formatgroupchats ||
        !getAllusershere.totalDirectChats ||
        !getAllusershere.totalGroupChats
      ) {
       return {
         foundUsers: [],
         formattedChats: [],
         formatgroupchats: [],
         totalDirectChats: 0,
         totalGroupChats:0
       };
      }

      const {
        formattedChats,
        foundUsers,
        formatgroupchats,
        totalGroupChats,
        totalDirectChats,
      } = getAllusershere;

      return {
        formattedChats,
        foundUsers,
        formatgroupchats,
        totalGroupChats,
        totalDirectChats,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async findAllUsers(userId: unknown): Promise<IUser[] | undefined> {
    try {
      const getUsers = await this.chatRepository.findAllUsersFound(userId);
      if (!getUsers) {
        throw new Error("No users found");
      }
      return getUsers;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllChatsHere(
    userId: unknown,
    page: number,
    limit: number
  ): Promise<{ groupChats: Chats[]; totalGroupChats: number } | undefined> {
    try {
      const getAllgroupChat = await this.chatRepository.findgroupChats(
        userId,
        page,
        limit
      );
      if (!getAllgroupChat?.groupChats || !getAllgroupChat?.totalGroupChats) {
        return {
          groupChats:[],
          totalGroupChats:0,
        };
      }
      const { groupChats, totalGroupChats } = getAllgroupChat;

      return {
        groupChats,
        totalGroupChats,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getOtherusers(
    userId: string | unknown,
    page: number,
    limit: number
  ): Promise<{ followusers: IUser[]; totalfollow: number } | undefined> {
    try {
      const getAllusershere = await this.chatRepository.findOtherusers(
        userId,
        page,
        limit
      );

      if (!getAllusershere?.followusers || !getAllusershere?.totalfollow) {
       
           return {
             followusers:[],
             totalfollow:0,
           };
      }

      const { followusers, totalfollow } = getAllusershere;

      return {
        followusers,
        totalfollow,
      };
    } catch (error) {
      console.log(error);
    }
  }
}

export default ChatServices;
