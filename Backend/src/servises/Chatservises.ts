import { Chats } from "../entities/userEntities";
import chatRepository from "../Repository/ChatRepository";

class ChatServices {
  constructor(private chatRepository: chatRepository) {}

  async getAccessChat(userId: string, chatId: string): Promise<Chats | any> {
    try {
      const chatRepository = await this.chatRepository.findAccesschat(
        userId,
        chatId
      );
      console.log(
        chatRepository,
        "chat repoooooooooooooooooooooooooooooooooooooooooo"
      );

      if (!chatRepository) {
        throw new Error("Cannot find the chatschema");
      }
      return chatRepository;
    } catch (error) {
      console.log(error);
    }
  }
}

export default ChatServices;
