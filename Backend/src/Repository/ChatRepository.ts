import { Chats } from "../entities/userEntities";
import ChatSchemamodel from "../model/ChatModel";



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

     if (isChat.length > 0) {
       let fullChat = isChat[0];
       console.log(fullChat, "get her first repo");
       return fullChat;
     } else {
       const chatData = {
         chatName: "sender",
         isGroupchat: false,
         users: [userId, chatId],
       };
       const createChat = await ChatSchemamodel.create(chatData);
       const fullChat = await ChatSchemamodel.findOne(createChat._id).populate(
         "users",
         "-password"
       );

       return fullChat;
     }
   }
 }


 export default chatRepository;