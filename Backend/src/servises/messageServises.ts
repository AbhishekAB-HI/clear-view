import { IUser, Message } from "../entities/userEntities";
import messageRepository from "../Repository/messageRepository";

class MessageServices {
  constructor(private messageRepo: messageRepository) {}

  async sendAllmessages(
    userId: string,
    content: string,
    chatId: string,
    imageUrls: string[],
    videoUrls: string[]
  ): Promise<Message | undefined> {
    const getAllmessges = await this.messageRepo.sendAllDataToRepo(
      userId,
      content,
      chatId,
      imageUrls,
      videoUrls
    );

    if (!getAllmessges) {
      throw new Error("No message get");
    }

    return getAllmessges;
  }

  async findAllmessages(chatid: string): Promise<Message[] | undefined> {
    const gettheMessages = await this.messageRepo.getAllmessages(chatid);

    if (!gettheMessages) {
      throw new Error("No messages found");
    }
    return gettheMessages;
  }

  async getUserInfomation(userid: string):Promise <IUser|null> {
                  
     const  getUsers = await this.messageRepo.getalluserinfo(userid);

     if(!getUsers){
      throw new Error("No user founded")
     }

     return getUsers;


  }
}

export default MessageServices;
