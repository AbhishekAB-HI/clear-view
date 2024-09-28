import { Chats, IUser } from "../entities/userEntities";
import ChatSchemamodel from "../model/ChatModel";
import UserSchemadata from "../model/userModel";

class chatRepository {




  async findAccesschat(userId: string, chatId: string): Promise<Chats | null> {
    let isChat = await ChatSchemamodel.find({
      isGroupchat: false,
      $and: [
        { users: { $elemMatch: { $eq: userId } } },
        { users: { $elemMatch: { $eq: chatId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await ChatSchemamodel.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    // Generate a random alphanumeric string
    function generateRandomString(length:any) {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";

      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }

      return result;
    }

    let getPincode = generateRandomString(20)

    if (isChat.length > 0) {
      let fullChat = isChat[0];
      return fullChat;
    } else {
      const chatData = {
        chatName: "sender",
        isGroupchat: false,
        users: [userId, chatId],
        roomId: getPincode,
      };
      const createChat = await ChatSchemamodel.create(chatData);
      const fullChat = await ChatSchemamodel.findOne(createChat._id).populate(
        "users",
        "-password"
      );
      return fullChat;
    }
  }






  async findAllchats(userId: string):Promise<IUser[]| undefined> {
    try {
      const chats = await ChatSchemamodel.find({
        users: { $elemMatch: { $eq: userId } },
      })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 });
      const result = await UserSchemadata.populate(chats, {
        path: "latestMessage.sender",
        select: "name pic email",
      });
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async findOtherusers(userId: string): Promise<IUser[] | undefined> {
    try {
      const foundUsers = await UserSchemadata.find({ _id: { $ne: userId } });
      if (foundUsers) {
        return foundUsers;
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default chatRepository;
