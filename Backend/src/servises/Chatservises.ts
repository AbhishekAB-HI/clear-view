import { promises } from "dns";
import { Chats, IUser } from "../entities/userEntities";
import chatRepository from "../Repository/ChatRepository";

class ChatServices {
  constructor(private chatRepository: chatRepository) {}

  async getAccessChat(userId: string, chatId: string): Promise<Chats | any> {
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

  async getUserBlockStatus(userId: string): Promise<boolean | undefined> {
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

    console.log(addedFollower, "serviswessssssssssss");
    return addedFollower;
  }
  async getAllChats(userId: string): Promise<IUser[] | undefined> {
    const chatrecivefromRepo = await this.chatRepository.findAllchats(userId);
    if (!chatrecivefromRepo) {
      throw new Error("no chat get");
    }
    return chatrecivefromRepo;
  }
  async getAllFollowers(userId: string): Promise<IUser[] | undefined> {
    const foundUser = await this.chatRepository.findAllFollowers(userId);
    return foundUser;
  }

  async findAllGetUsers(userId: string): Promise<IUser[] | undefined> {
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

  async getOthermessage(userId: string): Promise<IUser[] | undefined> {
    try {
      const getAllusershere = await this.chatRepository.findOtherMessages(
        userId
      );

      if (getAllusershere) {
        return getAllusershere;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getOtherusers(userId: string): Promise<IUser[] | undefined> {
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
