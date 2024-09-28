import { Chats, IUser, Message } from "../entities/userEntities";
import ChatSchemamodel from "../model/ChatModel";
import messageSchemaModel from "../model/messageModel";
import UserSchemadata from "../model/userModel";

class messageRepository {
  async sendAllDataToRepo(
    userId: string,
    content: string,
    chatId: string,
    imageUrls: string[],
    videoUrls: string[]
  ): Promise<Message | undefined> {
    const newMessage = {
      sender: userId,
      content: content,
      chat: chatId,
      image: imageUrls,
      videos: videoUrls,
    };

    let message = await messageSchemaModel.create(newMessage);
    message = await message.populate("sender", "name image");
    message = await message.populate("chat");
    await ChatSchemamodel.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });
    return message;
  }

  async getalluserinfo(userid: string): Promise<IUser | null> {
    const userinfo = await UserSchemadata.findById(userid);
    return userinfo;
  }

  async getAllmessages(chatid: string): Promise<Message[] | undefined> {
    const messages = await messageSchemaModel
      .find({ chat: chatid })
      .populate("sender", "name image email")
      .populate("chat");
    return messages;
  }
}

export default messageRepository;
