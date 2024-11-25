import mongoose, { ObjectId, Types } from "mongoose";
import { IUser } from "../Entities/Userentities";
import { Chats, FormattedChat, IUser1 } from "../Entities/Chatentities";
import ChatSchemamodel from "../Model/Chatmodel";
import UserSchemadata from "../Model/Usermodel";
import NotifiactSchemaModal from "../Model/NotificationSchema";
import { Notification } from "../Entities/Notification";
import newspostSchemadata from "../Model/Newsmodal";
import newspostSchemadataNotifications from "../Model/PostNotifications";
import { Posts } from "../Entities/Postentities";
import GetAllNotificationsSchema from "../Model/AllnotificationSchema";
import {
  IAllNotification,
  IFollowNotification,
} from "../Interface/userInterface/Userdetail";

class chatRepository {
  async findAccessgroupchat(chatId: string): Promise<Chats | null> {
    let isChat = await ChatSchemamodel.findById(chatId)
      .populate("users", "-password")
      .populate("latestMessage");
    isChat = await ChatSchemamodel.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
    return isChat;
  }

  async findAccesschat(
    userId: string | unknown,
    chatId: string
  ): Promise<Chats | null> {
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

      const deletedNotifications = await NotifiactSchemaModal.deleteMany({
        chat: fullChat._id,
      });

      if (deletedNotifications.deletedCount > 0) {
        console.log(
          `${deletedNotifications.deletedCount} notifications deleted for chat ID: ${fullChat._id}`
        );
      } else {
        console.log(`No notifications found for chat ID: ${fullChat._id}`);
      }
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

  async createNewGroup(groupname: string, userLists: IUser[], userId: unknown) {
    try {
      const newGroupChat = new ChatSchemamodel({
        chatName: groupname,
        isGroupchat: true,
        users: [...userLists.map((user) => user._id), userId],
        groupAdmin: userId,
      });
      const savedGroupChat = await newGroupChat.save();
      savedGroupChat;

      const fullGroupChat = await ChatSchemamodel.findOne({
        _id: savedGroupChat._id,
      })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

      return fullGroupChat;
    } catch (error) {
      console.error("Error creating group chat:", error);
      throw new Error("Failed to create group chat");
    }
  }

  async findAllchats(userId: string | unknown): Promise<IUser[] | undefined> {
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

  async getUserdetails(userId: unknown): Promise<IUser | unknown> {
    try {
      const UserFounded = await UserSchemadata.findById(userId);
      return UserFounded;
    } catch (error) {
      console.log(error);
    }
  }

  async getUserIdstatus(userId: unknown) {
    try {
      const UserFounded = await UserSchemadata.findById(userId);
      const findAllusers = await UserSchemadata.find();
      const eachuserids = findAllusers.map((user) => user._id);

      console.log(UserFounded, "UserFound");
      console.log(eachuserids, "All User IDs");

      const isFollowingAny = eachuserids.some((userid) =>
        UserFounded?.following.includes(userid as any)
      );

      console.log(isFollowingAny, "Following status");
    } catch (error) {
      console.log(error);
    }
  }

  async getUserIdHere(userId: string | unknown): Promise<boolean | undefined> {
    try {
      const UserFounded = await UserSchemadata.findById(userId);

      const findtheUsers = await UserSchemadata.find({});

      const findAllUserid = findtheUsers.map((item: any) =>
        item._id.toString()
      );

      const Blocked = UserFounded?.blockedUser.some((blockedUser) =>
        findAllUserid.includes(blockedUser.toString())
      );

      return Blocked;
    } catch (error) {
      console.log(error);
    }
  }
  async addrepFollowers(
    userId: string,
    loggedUserId: string
  ): Promise<{
    followingUser: IAllNotification | any;
    isAlreadyFollowing: boolean | unknown;
    Userinfo: IUser | unknown;
  }> {
    try {
      const followingUser = await UserSchemadata.findById(loggedUserId);
      const followerUser = await UserSchemadata.findById(userId);

      if (!mongoose.isValidObjectId(userId)) {
        console.error(`Invalid ObjectId for followid: ${userId}`);
        throw new Error("Invalid followid. Must be a valid ObjectId.");
      }

      const objectIdFollowid = new mongoose.Types.ObjectId(userId);

      // Fetch user data
      const userData = await UserSchemadata.findById(loggedUserId);

      if (!userData) {
        throw new Error("No user data is ther");
      }
      console.log("User data:", userData);

      const FollowPostid = userData._id; // Directly use _id
      console.log("FollowPostid:", FollowPostid);

      if (!followingUser) {
        throw new Error("Logged-in user not found");
      }

      if (!followerUser) {
        throw new Error("Target user not found");
      }

      const isAlreadyFollower = followerUser.followers.some(
        (follower) => follower.toString() === loggedUserId
      );

      const isAlreadyFollowing = followingUser.following.some(
        (following) => following.toString() === userId
      );

      const updatedFollowerUser = isAlreadyFollower
        ? await UserSchemadata.findByIdAndUpdate(
            userId,
            { $pull: { followers: loggedUserId } },
            { new: true }
          )
        : await UserSchemadata.findByIdAndUpdate(
            userId,
            { $addToSet: { followers: loggedUserId } },
            { new: true }
          );

      const updatedFollowingUser = isAlreadyFollowing
        ? await UserSchemadata.findByIdAndUpdate(
            loggedUserId,
            { $pull: { following: userId } },
            { new: true }
          )
        : await UserSchemadata.findByIdAndUpdate(
            loggedUserId,
            { $addToSet: { following: userId } },
            { new: true }
          );

      const existingFollowingUser = await GetAllNotificationsSchema.findOne({
        "Follownotifications.email": userData.email,
      });
      if (existingFollowingUser) {
        console.log("2222222222222222222222222222222222222222");
        return {
          followingUser: existingFollowingUser,
          isAlreadyFollowing: true,
          Userinfo: updatedFollowingUser,
        };
      }
      const SaveuserFollowinfo = {
        userId: objectIdFollowid,
        userName: userData.name,
        image: userData.image,
        email: userData.email,
        followuserId: FollowPostid,
      };

      const Saveuserfind = new GetAllNotificationsSchema({
        Follownotifications: [SaveuserFollowinfo],
      });

      const AlldataSave = await Saveuserfind.save();

      return {
        followingUser: AlldataSave,
        isAlreadyFollowing: !isAlreadyFollowing,
        Userinfo: updatedFollowerUser,
      };
    } catch (error) {
      console.error("Error updating followers:", error);

      return {
        followingUser: null,
        isAlreadyFollowing: null,
        Userinfo: undefined,
      };
    }
  }

  // async addrepFollowers(
  //   userId: any,
  //   loggedUserId: any
  // ): Promise<{
  //   followingUser: unknown | null;
  //   isAlreadyFollowing: boolean | null;
  // }> {
  //   try {
  //     if (
  //       !mongoose.isValidObjectId(userId) ||
  //       !mongoose.isValidObjectId(loggedUserId)
  //     ) {
  //       throw new Error(
  //         "Invalid userId or loggedUserId. Must be valid ObjectIds."
  //       );
  //     }

  //     const [followingUser, followerUser] = await Promise.all([
  //       UserSchemadata.findById(loggedUserId),
  //       UserSchemadata.findById(userId),
  //     ]);

  //     if (!followingUser || !followerUser) {
  //       throw new Error("User not found");
  //     }

  //     const isAlreadyFollower = followerUser.followers?.includes(loggedUserId);
  //     const isAlreadyFollowing = followingUser.following?.includes(userId);

  //     // Update follower and following lists
  //     await Promise.all([
  //       UserSchemadata.findByIdAndUpdate(
  //         userId,
  //         isAlreadyFollower
  //           ? { $pull: { followers: loggedUserId } }
  //           : { $addToSet: { followers: loggedUserId } },
  //         { new: true }
  //       ),
  //       UserSchemadata.findByIdAndUpdate(
  //         loggedUserId,
  //         isAlreadyFollowing
  //           ? { $pull: { following: userId } }
  //           : { $addToSet: { following: userId } },
  //         { new: true }
  //       ),
  //     ]);

  //     // Handle notifications
  //     const SaveuserFollowinfo = {
  //       userId: new mongoose.Types.ObjectId(userId),
  //       userName: followingUser.name,
  //       image: followingUser.image,
  //       email: followingUser.email,
  //       followuserId: followingUser._id,
  //     };

  //     const notification = await GetAllNotificationsSchema.findOneAndUpdate(
  //       { "Follownotifications.email": followingUser.email },
  //       { $addToSet: { Follownotifications: SaveuserFollowinfo } },
  //       { new: true, upsert: true }
  //     );

  //     return {
  //       followingUser: notification,
  //       isAlreadyFollowing: !isAlreadyFollowing,
  //     };
  //   } catch (error) {
  //     console.error("Error updating followers:", error);
  //     return { followingUser: null, isAlreadyFollowing: null };
  //   }
  // }

  async findAllPostNotifications(
    postid: unknown
  ): Promise<Posts | null | undefined> {
    try {
      const getpostinfo = await newspostSchemadata.findById(postid);

      if (!getpostinfo) {
        throw new Error("Post not found");
      }

      GetAllNotificationsSchema;

      const createdNewPostschema = new newspostSchemadataNotifications({
        user: getpostinfo.user,
        description: getpostinfo.description,
        image: getpostinfo.image,
        videos: getpostinfo.videos,
        text: getpostinfo.text,
        category: getpostinfo.category,
        likeCount: getpostinfo.likeCount,
        BlockPost: getpostinfo.BlockPost,
        LikeStatement: getpostinfo.LikeStatement,
        likes: getpostinfo.likes,
        comments: getpostinfo.comments,
        reportPost: getpostinfo.reportPost,
      });

      const updateUserpost = await createdNewPostschema.save();

      console.log(
        updateUserpost,
        "222222222222222222222222222222222222222222222"
      );
      return updateUserpost;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findAllfollowNotifications(
    userId: unknown | mongoose.Types.ObjectId,
    value: boolean | unknown,
    followid: any
  ): Promise<IFollowNotification | unknown> {
    try {
      console.log("Received userId:", userId);
      console.log("Received followid:", followid);

      if (!mongoose.isValidObjectId(followid)) {
        console.error(`Invalid ObjectId for followid: ${followid}`);
        throw new Error("Invalid followid. Must be a valid ObjectId.");
      }

      const objectIdFollowid = new mongoose.Types.ObjectId(followid);

      // Fetch user data
      const userData = await UserSchemadata.findById(userId);
      if (!userData) {
        console.error("User not found for userId:", userId);
        return null;
      }

      console.log("User data:", userData);

      const FollowPostid = userData._id; // Directly use _id
      console.log("FollowPostid:", FollowPostid);

      const existingFollowingUser = await GetAllNotificationsSchema.findOne({
        "Follownotifications.email": userData.email,
      });

      if (existingFollowingUser) {
        console.log(
          "Existing follow notification found for email:",
          userData.email
        );
        return existingFollowingUser;
      }

      const SaveuserFollowinfo = {
        userId: objectIdFollowid,
        userName: userData.name,
        image: userData.image,
        email: userData.email,
        followuserId: FollowPostid,
      };

      console.log("SaveuserFollowinfo:", SaveuserFollowinfo);

      const Saveuserfind = new GetAllNotificationsSchema({
        Follownotifications: [SaveuserFollowinfo],
      });

      const AlldataSave = await Saveuserfind.save();
      console.log("Follow notification saved successfully:", AlldataSave);

      return AlldataSave;
    } catch (error) {
      console.error("Error saving follow notification:", error);
      return null;
    }
  }

  async findAllNotifications(
    userId: unknown
  ): Promise<Notification[] | undefined> {
    try {
      const Chats = await ChatSchemamodel.find({ users: userId });
      const findAllchatid = Chats.map((chat) => chat._id);
      if (findAllchatid.length > 0) {
        const findAllnotifications = await NotifiactSchemaModal.find({
          chat: { $in: findAllchatid },
          sender: { $ne: userId },
        })
          .populate("sender")
          .populate("chat");

        return findAllnotifications;
      } else {
        console.log("No chat IDs found for the user.");
        return [];
      }
    } catch (error) {
      console.log(error);
    }
  }

  async FindAllUsers(userId: unknown) {
    try {
      const findAllusers = await UserSchemadata.find({ _id: { $ne: userId } });
      if (!findAllusers) {
        throw new Error("No users found");
      }
      return findAllusers;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllNotifications(userId: any): Promise<{
    followNotifications: any[];
    postNotifications: any[];
    likeNotifications: any[];
  }> {
    try {
      const Follownotifications = await GetAllNotificationsSchema.find(
        { "Follownotifications.userId": userId },
        { Follownotifications: 1 }
      );
      const notificationsData = Follownotifications.flatMap((doc) =>
        doc.Follownotifications.filter(
          (notification) =>
            (notification.userId as mongoose.Types.ObjectId).toString() ===
            userId.toString()
        ).map((notification) => ({
          userName: notification.userName,
          email: notification.email,
          image: notification.image,
          followuserId: notification.followuserId,
        }))
      );

      const findAllThePost = await GetAllNotificationsSchema.find({
        "PostNotifications.userId": userId,
      }).populate({
        path: "PostNotifications.userId",
        select: "name email image",
      });

      const getAllPostNotify = findAllThePost.flatMap((doc) =>
        doc.PostNotifications.filter((notify: any) =>
          notify.userId.some((id: mongoose.Types.ObjectId) => id.equals(userId))
        ).map((notify) => ({
          postUsername: notify.postusername,
          image: notify.image,
          content: notify.content,
          followuserId: notify.followuserId,
        }))
      );

      const LikeNotificationsdetail = await GetAllNotificationsSchema.find({
        "LikeNotifications.postuserId": userId,
      });

      const getAllLikedusers = LikeNotificationsdetail?.flatMap((doc) =>
        doc.LikeNotifications.filter((notify: any) =>
          notify.postuserId.some((id: mongoose.Types.ObjectId) =>
            id.equals(userId)
          )
        ).map((notify) => ({
          likedusername: notify.likedusername,
          userimage: notify.userimage,
          postimage: notify.postimage,
          postcontent: notify.postcontent,
          likeduserId: notify.likeduserId,
        }))
      );

      return {
        followNotifications: notificationsData,
        postNotifications: getAllPostNotify,
        likeNotifications: getAllLikedusers,
      };
    } catch (error) {
      console.error("Error finding notifications or posts:", error);
      throw error;
    }
  }

  async findAllFollowers(userId: string | unknown,page: number,limit: number): Promise<{ users: IUser[]; totalfollowers: number } | undefined> {
    try {
      const offset = (page - 1) * limit;
      const currentUser = await UserSchemadata.findById(userId);
      if (!currentUser) {
        throw new Error("User not found");
      }
      const blockedUsers = currentUser.blockedUser || [];
      const foundUser = await UserSchemadata.findById(userId, { followers: 1 })
        .populate("followers")
        .skip(offset)
        .limit(limit);
      const totalusers = currentUser.followers.length;
      console.log(totalusers, "count");
      const followers = foundUser?.followers || [];
      const filteredFollowers = followers.filter(
        (follower: any) => !blockedUsers.includes(follower._id.toString())
      );

      return {
        users: filteredFollowers,
        totalfollowers: totalusers,
      };
    } catch (error) {
      console.log("Error finding followers:", error);
      return undefined;
    }
  }

  async findAllOtherusers(userId: string | unknown,page: number,limit: number): Promise<{ Allusers: IUser[] | undefined; totalusers: number } | undefined> {
    try {
      const offset = (page - 1) * limit;
      const findcurrentuser = await UserSchemadata.findById(userId);
      if (!findcurrentuser) {
        throw new Error("User not found");
      }
   
      const foundUsers = await UserSchemadata.find({
        _id: { $ne: userId }, 
      }).skip(offset).limit(limit);

       const Totalusers = await UserSchemadata.countDocuments({
         _id: { $ne: userId },
       });

      return {
        Allusers: foundUsers,
        totalusers: Totalusers,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async findOtherMessages(
    userId: string | unknown,
    page: number,
    limit: number
  ): Promise<
    | {
        foundUsers: IUser[];
        formattedChats: FormattedChat[];
        formatgroupchats: FormattedChat[];
        totalDirectChats: number;
        totalGroupChats: number;
      }
    | undefined
  > {
    try {
      const offset = (page - 1) * limit;
      const currentUser = await UserSchemadata.findById(userId);
      if (!currentUser) {
        throw new Error("User not found");
      }

      const blockedUsers = currentUser.blockedUser || [];

      // Direct Chats
      const totalDirectChats = await ChatSchemamodel.find({
        isGroupchat: false,
        latestMessage: { $ne: null },
        users: { $in: [userId] },
      }).countDocuments();

      const chats = await ChatSchemamodel.find({
        isGroupchat: false,
        latestMessage: { $ne: null },
        users: { $in: [userId] },
      })
        .sort({ updatedAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate([
          {
            path: "latestMessage",
            select: "content createdAt sender",
            populate: { path: "sender", model: "userdetail", select: "name" },
          },
          { path: "users", select: "name image" },
        ])
        .exec();

      const otherUserIds = chats.flatMap((chat) =>
        chat.users
          .map((user) => user._id as Types.ObjectId)
          .filter(
            (id) => !(id as Types.ObjectId).equals(userId as Types.ObjectId)
          )
      );

      const userData = await Promise.all(
        otherUserIds.map(async (userId) => {
          const result = await UserSchemadata.find({
            _id: { $in: [userId], $nin: blockedUsers },
          });
          return result;
        })
      );

      const foundUsers = userData.flat();

      const formattedChats = chats.map((chat) => {
        const otherUser = chat.users.find(
          (user) =>
            !(user._id as Types.ObjectId).equals(userId as Types.ObjectId)
        );
        return {
          chatName: otherUser?.name || chat.chatName,
          lastMessage: chat.latestMessage?.content || "No messages yet",
          lastMessageTime: chat.latestMessage?.createdAt || "N/A",
          userId: otherUser?._id,
        };
      });

      // Group Chats
      const totalGroupChats = await ChatSchemamodel.find({
        isGroupchat: true,
        users: { $in: [userId] },
      }).countDocuments();

      const groupchats = await ChatSchemamodel.find({
        isGroupchat: true,
        users: { $in: [userId] },
      })
        .sort({ "latestMessage.createdAt": -1 })
        .skip(offset)
        .limit(limit)
        .populate({
          path: "latestMessage",
          select: "content createdAt",
        })
        .exec();

      const formatgroupchats = groupchats.map((chat) => ({
        chatName: chat.chatName,
        lastMessage: chat.latestMessage?.content || "No messages yet",
        lastMessageTime: chat.latestMessage?.createdAt || "N/A",
        userId: chat.groupAdmin,
      }));

      return {
        foundUsers,
        formattedChats,
        formatgroupchats,
        totalDirectChats,
        totalGroupChats,
      };
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  async findAllUsersFound(userId: unknown): Promise<IUser[] | undefined> {
    try {
      const currentUser = await UserSchemadata.findById(userId);
      if (!currentUser) {
        throw new Error("User not found");
      }
      const blockedUsers = currentUser.blockedUser || [];
      const getAllusers = await UserSchemadata.find({
        _id: { $ne: userId, $nin: blockedUsers },
      });
      return getAllusers;
    } catch (error) {
      console.log(error);
    }
  }

  async findgroupChats(
    userId: unknown,
    page: number,
    limit: number
  ): Promise<{ groupChats: Chats[]; totalGroupChats: number } | undefined> {
    try {
      const offset = (page - 1) * limit;
      const groupChats = await ChatSchemamodel.find({
        isGroupchat: true,
        users: { $in: [userId] },
      })
        .sort({ "latestMessage.createdAt": -1 })
        .skip(offset)
        .limit(limit)
        .populate({
          path: "users",
          select: "name email image",
        });

      const totalGroupChats = await ChatSchemamodel.find({
        isGroupchat: true,
        users: { $in: [userId] },
      }).countDocuments();

      return {
        groupChats,
        totalGroupChats,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async findOtherusers(
    userId: string | unknown,
    page: number,
    limit: number
  ): Promise<{ followusers: IUser[]; totalfollow: number } | undefined> {
    try {
      const currentUser = await UserSchemadata.findById(userId);
      if (!currentUser) {
        throw new Error("User not found");
      }
      const offset = (page - 1) * limit;

      const blockedUsers = currentUser.blockedUser || [];

      const foundUsers = await UserSchemadata.findById(userId, { following: 1 })
        .populate("following")
        .skip(offset)
        .limit(limit);

      const totalfollowing = currentUser?.following.length;

      const following = foundUsers?.following || [];

      const filteredFollowing = following.filter(
        (following: any) => !blockedUsers.includes(following._id.toString())
      );

      return {
        totalfollow: totalfollowing,
        followusers: filteredFollowing,
      };
    } catch (error) {
      console.log(error);
    }
  }
}

export default chatRepository;
