import { promises } from "dns";
import { IUser } from "../Entities/Userentities";
import { Chats, FormattedChat } from "../Entities/Chatentities";
import chatRepository from "../Repository/Chatrepository";
import { Notification } from "../Entities/Notification";
import { error } from "console";

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
    } catch (error) {}
  }

  async AddToFollowers(
    userId: string,
    LoguserId: string
  ): Promise<boolean | unknown> {
    const addedFollower = await this.chatRepository.addrepFollowers(
      userId,
      LoguserId
    );

    return addedFollower;
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

  async getAllFollowers(
    userId: string | unknown
  ): Promise<IUser[] | undefined> {
    const foundUser = await this.chatRepository.findAllFollowers(userId);
    return foundUser;
  }

  async findAllGetUsers(
    userId: string | unknown
  ): Promise<IUser[] | undefined> {
    try {
      const getAllusershere = await this.chatRepository.findAllOtherusers(
        userId
      );

      if (getAllusershere) {
        return getAllusershere;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getOthermessage(userId: string | unknown): Promise<
    | {
        foundUsers: IUser[];
        formattedChats: FormattedChat[];
        formatgroupchats: FormattedChat[];
      }
    | undefined
  > {
    try {
      const getAllusershere = await this.chatRepository.findOtherMessages(
        userId
      );

      if (
        !getAllusershere?.formattedChats ||
        !getAllusershere.foundUsers ||
        !getAllusershere.formatgroupchats
      ) {
        throw Error(" No users or message not found");
      }

      const { formattedChats, foundUsers, formatgroupchats } = getAllusershere;

      return {
        formattedChats,
        foundUsers,
        formatgroupchats,
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

  async getAllChatsHere(userId: unknown): Promise<Chats[] | undefined> {
    try {
      const getAllgroupChat = await this.chatRepository.findgroupChats(userId);

      if (!getAllgroupChat) {
        throw new Error("No chat found");
      }

      return getAllgroupChat;
    } catch (error) {
      console.log(error);
    }
  }

  async getOtherusers(userId: string | unknown): Promise<IUser[] | undefined> {
    try {
      const getAllusershere = await this.chatRepository.findOtherusers(userId);

      if (getAllusershere) {
        return getAllusershere;
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default ChatServices;
