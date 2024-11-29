import { Message } from "../../entities/Chatentities";
import { IUser } from "../../entities/userEntities";

export interface IMessageRepository {
  sendAllDataToRepo(
    userId: string,
    content: string,
    chatId: string,
    imageUrls: string[],
    videoUrls: string[]
  ): Promise<Message | undefined>;
  getalluserinfo(userid: string): Promise<IUser | null>;
  findUserBlock(
    userId: string,
    logedUserId: string
  ): Promise<boolean | undefined>;
  getAllmessages(chatid: string): Promise<Message[] | undefined>;
}
