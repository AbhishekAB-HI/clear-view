import { promises } from "dns";
import { IUser } from "../entities/userEntities";
import { Chats, FormattedChat } from "../entities/Chatentities";
import chatRepository from "../Repository/Chatrepository";
import { Notification } from "../entities/Notification";
import { error } from "console";
import { Types } from "mongoose";
import { Posts } from "../entities/Postentities";
import {
  IAllNotification,
  IFollowNotification,
} from "../entities/Notificationentitities";
import { IChatServices } from "../Interface/Chats/ChatServices";
import { IChatRepository } from "../Interface/Chats/ChatRepository";
import { generateRandomString } from "../Utils/Generageradomroomid";

class ChatServices implements IChatServices {
  constructor(private chatRepository: IChatRepository) {}

  async getAccessgroupChat(chatId: string): Promise<Chats | unknown> {
    try {
      // const chatRepository = await this.chatRepository.findAccessgroupchat(chatId);
      const FindTheChat = await this.chatRepository.findTheChatHere(chatId);
      if (!FindTheChat) {
        return null;
      }
      const populatetheChathere = await this.chatRepository.findAndPopulateChat(
        FindTheChat
      );
      if (!populatetheChathere) {
        throw new Error("Cannot find the chatschema");
      }
      return populatetheChathere;
    } catch (error) {
      console.log(error);
    }
  }
  async getAccessChat(
    userId: string,
    chatId: string
  ): Promise<Chats | unknown> {
    try {
      const findExistingChat = await this.chatRepository.findExistingChat(
        userId,
        chatId
      );
      if (findExistingChat.length > 0) {
        const populateLatestMessage =
          await this.chatRepository.populateLatestMessage(findExistingChat);
        const deletedNotifications =
          await this.chatRepository.deleteNotificationsByChat(
            findExistingChat[0]._id.toString()
          );
        return findExistingChat[0];
      } else {
        const roomId = generateRandomString(20);
        const newChatData = {
          chatName: "sender",
          isGroupchat: false,
          users: [userId, chatId].map((id) => ({ _id: id } as IUser)),
          roomId,
        };
        const createdChat = await this.chatRepository.createChat(newChatData);
        return await this.chatRepository.findChatById(
          createdChat._id.toString()
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  // async getAccessChat(
  //   userId: string | unknown,
  //   chatId: string
  // ): Promise<Chats | unknown> {
  //   try {
  //     const chatRepository = await this.chatRepository.findAccesschat(
  //       userId,
  //       chatId
  //     );

  //     const findExistingChat = await this.chatRepository.findExistingChat(
  //       userId,
  //       chatId
  //     );

  //     const populateLatestMessage =
  //       await this.chatRepository.populateLatestMessage(findExistingChat);

  //     if (!chatRepository) {
  //       throw new Error("Cannot find the chatschema");
  //     }
  //     return chatRepository;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

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

  async searchAllNotifications(
    userId: unknown
  ): Promise<Notification[] | unknown> {
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

  // async getOtherusers(
  //   userId: string,
  //   page: number,
  //   limit: number
  // ): Promise<{ followusers: IUser[]; totalfollow: number } | undefined> {
  //   try {

  //     if (!findcurrentuser?.totalfollowing) {
  //       return {
  //         followusers: [],
  //         totalfollow: 0,
  //       };
  //     }

  //     const { blockedUsers, totalfollowing } = findcurrentuser;

  //     const findFollowing = await this.chatRepository.findFollowingUsers(
  //       userId,
  //       page,
  //       limit
  //     );

  //     const filteredFollowing = findFollowing?.filter(
  //       (following: any) => !blockedUsers.includes(following._id.toString())
  //     );

  //     if (!filteredFollowing) {
  //       return {
  //         followusers: [],
  //         totalfollow: 0,
  //       };
  //     }
  //     // const getAllusershere = await this.chatRepository.findOtherusers(
  //     //   userId,
  //     //   page,
  //     //   limit
  //     // );

  //     // if (!getAllusershere?.followusers || !getAllusershere?.totalfollow) {
  //     //   return {
  //     //     followusers: [],
  //     //     totalfollow: 0,
  //     //   };
  //     // }

  //     // const { followusers, totalfollow } = getAllusershere;

  //     return {
  //       followusers: filteredFollowing,
  //       totalfollow: totalfollowing,
  //     };
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  async getAllFollowers(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ users: IUser[]; totalfollowers: number } | undefined> {
    const foundUser = await this.chatRepository.findAllFollowers(
      userId,
      page,
      limit
    );

    const findthelogedusers = await this.chatRepository.findthelogedusers(
      userId
    );
    if (!findthelogedusers?.totalfollower) {
      return {
        users: [],
        totalfollowers: 0,
      };
    }

    const { blockedUsers, totalfollower } = findthelogedusers;

    const findFollowers = await this.chatRepository.findFollowersUsers(
      userId,
      page,
      limit
    );
    const filteredFollowing = findFollowers?.filter(
      (following: any) => !blockedUsers.includes(following._id.toString())
    );

    if (!filteredFollowing) {
      return {
        users: [],
        totalfollowers: 0,
      };
    }

    return {
      totalfollowers: totalfollower,
      users: filteredFollowing,
    };
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
          totalGroupChats: 0,
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
          groupChats: [],
          totalGroupChats: 0,
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
    userId: string,
    page: number,
    limit: number
  ): Promise<{ followusers: IUser[]; totalfollow: number } | undefined> {
    try {
      const findcurrentuser = await this.chatRepository.findcurrentuser(userId);
      if (!findcurrentuser?.totalfollowing) {
        return {
          followusers: [],
          totalfollow: 0,
        };
      }

      const { blockedUsers, totalfollowing } = findcurrentuser;

      const findFollowing = await this.chatRepository.findFollowingUsers(
        userId,
        page,
        limit
      );

      const filteredFollowing = findFollowing?.filter(
        (following: any) => !blockedUsers.includes(following._id.toString())
      );

      if (!filteredFollowing) {
        return {
          followusers: [],
          totalfollow: 0,
        };
      }
      // const getAllusershere = await this.chatRepository.findOtherusers(
      //   userId,
      //   page,
      //   limit
      // );

      // if (!getAllusershere?.followusers || !getAllusershere?.totalfollow) {
      //   return {
      //     followusers: [],
      //     totalfollow: 0,
      //   };
      // }

      // const { followusers, totalfollow } = getAllusershere;

      return {
        followusers: filteredFollowing,
        totalfollow: totalfollowing,
      };
    } catch (error) {
      console.log(error);
    }
  }
}

export default ChatServices;
