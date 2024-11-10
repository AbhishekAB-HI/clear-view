import {  IUser } from "../Entities/Userentities";
import { Chats,Message } from "../Entities/Chatentities";
import ChatSchemamodel from "../Model/Chatmodel";
import messageSchemaModel from "../Model/Messagemodel";
import UserSchemadata from "../Model/Usermodel";
import NotifiactSchemaModal from "../Model/NotificationSchema";

class messageRepository {
  async sendAllDataToRepo(userId: string,content: string,chatId: string,imageUrls: string[],videoUrls: string[]): Promise<Message | undefined> {
    const newMessage = {
      sender: userId,
      content: content,
      chat: chatId,
      image: imageUrls,
      videos: videoUrls,
    };

    const userinfo =   await UserSchemadata.findById(userId)
    if (!userinfo) {
      throw new Error("User not found");
    }
        const newMessage2 = {
          sender: userId,
          content: content,
          sendername:userinfo.name,
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

    console.log(userinfo,'!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    
    return userinfo;
  }






  async findUserBlock(
    userId: string,
    logedUserId: string
  ): Promise<boolean | undefined> {
    const UserFounded = await UserSchemadata.findById(logedUserId);

    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    

    const Blocked = UserFounded?.blockedUser.some(
      (blockedUser) => blockedUser.toString() === userId
    );


    console.log(Blocked,'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
    
    let updateBlock;
    if (Blocked) {
       console.log(
         Blocked,
         "111111111111111111111111111111111111111111111111111111111111"
       );
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

      console.log(
        updateBlock,
        "111111111111111111111111111111111111111111111111111111111111"
      );
    }

    return Blocked;
  }





  async getAllmessages(chatid: string): Promise<Message[] | undefined> {
    
    const messages = await messageSchemaModel.find({ chat: chatid }).populate("sender", "name image email").populate("chat");
    return messages;


  }








}

export default messageRepository;
