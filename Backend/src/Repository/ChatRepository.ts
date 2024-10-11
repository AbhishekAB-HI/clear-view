import { ObjectId } from "mongoose";
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
    function generateRandomString(length: any) {
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

    let getPincode = generateRandomString(20);

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

  async findAllchats(userId: string): Promise<IUser[] | undefined> {
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

  async getUserIdHere(userId: string):Promise<boolean|undefined> {

     try {

       const UserFounded = await UserSchemadata.findById(userId);

       const findtheUsers = await UserSchemadata.find({});

       const findAllUserid = findtheUsers.map((item:any) => item._id.toString());

       const Blocked = UserFounded?.blockedUser.some((blockedUser) =>
         findAllUserid.includes(blockedUser.toString())
       );

       console.log(Blocked,'2222222222222222222222222222222222222222222222')

       return Blocked;


          // const findAllUserid =   findtheUsers.map((item)=> item._id)
          
      //  const Blocked = UserFounded?.blockedUser.some(
      //    (blockedUser) => blockedUser.toString() === findAllUserid
      //  );
      //  return Blocked;
      
     } catch (error) {
      console.log(error);
      
     }
   
  }

  async addrepFollowers(
    userId: string,
    loggedUserId: string
  ): Promise<boolean | unknown> {
    try {
      const followingUser = await UserSchemadata.findById(loggedUserId);

      const followerUser = await UserSchemadata.findById(userId);

      if (!followingUser) {
        throw new Error("User not found");
      }

      if (!followerUser) {
        throw new Error("User not found");
      }

      const isAlreadyFollowers = followerUser.followers.some(
        (followers) => followers.toString() === loggedUserId
      );

      const isAlreadyFollowing = followingUser.following.some(
        (following) => following.toString() === userId
      );

      let updateFollowerUsers;
      if (isAlreadyFollowers) {
        updateFollowerUsers = await UserSchemadata.findByIdAndUpdate(
          userId,
          {
            $pull: { followers: loggedUserId },
          },
          { new: true }
        );
      } else {
        updateFollowerUsers = await UserSchemadata.findByIdAndUpdate(
          userId,
          {
            $addToSet: { followers: loggedUserId },
          },
          { new: true }
        );
      }

      let updatedUser;
      if (isAlreadyFollowing) {
        updatedUser = await UserSchemadata.findByIdAndUpdate(
          loggedUserId,
          {
            $pull: { following: userId },
          },
          { new: true }
        );
      } else {
        updatedUser = await UserSchemadata.findByIdAndUpdate(
          loggedUserId,
          {
            $addToSet: { following: userId },
          },
          { new: true }
        );
      }

      return isAlreadyFollowing;
    } catch (error) {
      console.error("Error updating followers:", error);
    }
  }

  // async findAllUsers(userId:string){
  //           try {

  //        const      await UserSchemadata.findById(userId);

  //           } catch (error) {
  //             console.log(error);

  //           }
  // }
  async findAllFollowers(userId: string): Promise<IUser[] | undefined> {
    try {
      const currentUser = await UserSchemadata.findById(userId);
      if (!currentUser) {
        throw new Error("User not found");
      }

      const blockedUsers = currentUser.blockedUser || [];

      const foundUser = await UserSchemadata.findById(userId).populate(
        "followers"
      );

      const followers = foundUser?.followers || [];

      const filteredFollowers = followers.filter(
        (follower: any) => !blockedUsers.includes(follower._id.toString())
      );

      return filteredFollowers;
    } catch (error) {
      console.log("Error finding followers:", error);
      return undefined;
    }
  }

  async findAllOtherusers(userId: string): Promise<IUser[] | undefined> {
    try {
      //  const followerUser:any = await UserSchemadata.findById(userId);

      //  const isAlreadyFollowers = followerUser.followers.some(
      //    (followers:any) => followers.toString() === logedUserId
      //  );

      const foundUsers = await UserSchemadata.find({ _id: { $ne: userId } });
      if (foundUsers) {
        return foundUsers;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async findOtherMessages(userId: string): Promise<IUser[] | undefined> {
    try {
      const currentUser = await UserSchemadata.findById(userId);
      if (!currentUser) {
        throw new Error("User not found");
      }

      const blockedUsers = currentUser.blockedUser || [];

      const foundUsers = await UserSchemadata.find({
        _id: { $ne: userId, $nin: blockedUsers },
      });

      // Return the filtered users
      return foundUsers;
    } catch (error) {
      console.error("Error finding users:", error);
      return undefined;
    }
  }

  async findOtherusers(userId: string): Promise<IUser[] | undefined> {
    try {
      const currentUser = await UserSchemadata.findById(userId);
      if (!currentUser) {
        throw new Error("User not found");
      }

      const blockedUsers = currentUser.blockedUser || [];

      const foundUsers = await UserSchemadata.findById(userId).populate(
        "following"
      );
      const following = foundUsers?.following || [];

      const filteredFollowing = following.filter(
        (following: any) => !blockedUsers.includes(following._id.toString())
      );

      return filteredFollowing;
    } catch (error) {
      console.log(error);
    }
  }
}

export default chatRepository;
