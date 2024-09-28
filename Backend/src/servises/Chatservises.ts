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


  async getAllChats(userId:string):Promise <IUser[]| undefined>{
 const chatrecivefromRepo = await this.chatRepository.findAllchats(userId)
   if(!chatrecivefromRepo){
    throw  new Error ("no chat get")
   }
   return chatrecivefromRepo
  }

  async getOtherusers(userId: string):Promise<IUser[] | undefined>{
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
