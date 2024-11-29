import { IUser } from "../entities/userEntities";
import { Chats, Message } from "../entities/Chatentities";
import ChatSchemamodel from "../model/ChatModel";
import messageSchemaModel from "../model/messageModel";
import UserSchemadata from "../model/userModel";
import NotifiactSchemaModal from "../model/NotificationSchema";
import { IMessageRepository } from "../Interface/Messages/MessageRepository";

class messageRepository implements IMessageRepository {
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

    const userinfo = await UserSchemadata.findById(userId);
    if (!userinfo) {
      throw new Error("User not found");
    }
    const newMessage2 = {
      sender: userId,
      content: content,
      sendername: userinfo.name,
      chat: chatId,
      image: imageUrls,
      videos: videoUrls,
    };

    let message = await messageSchemaModel.create(newMessage);
    let Notifications = await NotifiactSchemaModal.create(newMessage2);
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

  async findUserBlock(
    userId: string,
    logedUserId: string
  ): Promise<boolean | undefined> {
    const UserFounded = await UserSchemadata.findById(logedUserId);
    const otherUserFounded = await UserSchemadata.findById(userId);
    const userBlocked = otherUserFounded?.blocked.some(
      (blockedUser) => blockedUser.toString() === logedUserId
    );
    const Blocked = UserFounded?.blockedUser.some(
      (blockedUser) => blockedUser.toString() === userId
    );

    let updateBlock;
    let updateBlocked;

    if (userBlocked) {
      updateBlocked = await UserSchemadata.findByIdAndUpdate(
        userId,
        {
          $pull: { blocked: logedUserId },
        },
        { new: true }
      );
    } else {
      updateBlocked = await UserSchemadata.findByIdAndUpdate(
        userId,
        {
          $addToSet: { blocked: logedUserId },
        },
        { new: true }
      );
    }

    if (Blocked) {
      updateBlock = await UserSchemadata.findByIdAndUpdate(
        logedUserId,
        {
          $pull: { blockedUser: userId },
        },
        { new: true }
      );
    } else {
      updateBlock = await UserSchemadata.findByIdAndUpdate(
        logedUserId,
        {
          $addToSet: { blockedUser: userId },
        },
        { new: true }
      );
    }

    return Blocked;
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
