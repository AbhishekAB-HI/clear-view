import { Request, Response } from "express";
import ChatSchemamodel from "../Model/Chatmodel";
import ChatServices from "../Servises/Chatservises";
import UserSchemadata from "../Model/Usermodel";
import { ObjectId } from "mongoose";
import { ACCESS_TOKEN } from "../Config/Jwt";
import { userPayload } from "../Interface/userInterface/Userpayload";
import jwt from "jsonwebtoken";
// import { ACCESS_TOKEN } from "../Config/Jwt";
// import { userPayload } from "../Interface/userInterface/Userpayload";
class ChatController {
  constructor(private ChatServices: ChatServices) {}

  async getAllmessages(req: Request, res: Response) {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token is missing" });
      }
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_PRIVATE_KEY || ACCESS_TOKEN
      ) as userPayload;
      const userId = decoded.id;

      if (!userId) {
        return res.status(400).json({ message: "User ID is missing" });
      }
      const OtherFiledata = await this.ChatServices.getOthermessage(userId);
      res
        .status(200)
        .json({ message: "other message get here", OtherFiledata });
    } catch (error) {
      console.log(error);
    }
  }

  async getgroupchats(req: Request, res: Response) {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token is missing" });
      }
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_PRIVATE_KEY || ACCESS_TOKEN
      ) as userPayload;
      const userId = decoded.id;

      const getAllChats = await this.ChatServices.getAllChatsHere(userId);
      res.status(200).json({ message: "get all chats", getAllChats });
    } catch (error) {
      console.log(error);
    }
  }

  async getAllUser(req: Request, res: Response) {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token is missing" });
      }
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_PRIVATE_KEY || ACCESS_TOKEN
      ) as userPayload;
      const userId = decoded.id;
      const otherusers = await this.ChatServices.getOtherusers(userId);

      res.status(200).json({ message: "Other users found", otherusers });
    } catch (error) {
      console.log(error);
    }
  }

  async FindAllUser(req: Request, res: Response) {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token is missing" });
      }
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_PRIVATE_KEY || ACCESS_TOKEN
      ) as userPayload;
      const userId = decoded.id;
      const Allusers = await this.ChatServices.findAllGetUsers(userId);
      res.status(200).json({ message: "Get all users", Allusers });
    } catch (error) {
      console.log(error);
    }
  }

  async CreateNewGroup(req: Request, res: Response) {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token is missing" });
      }
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_PRIVATE_KEY || ACCESS_TOKEN
      ) as userPayload;
      const userId = decoded.id;
      const { groupName, users } = req.body;
      const createdGroup = await this.ChatServices.getNewGroup(
        groupName,
        users,
        userId
      );
      res.status(200).json({ message: "created new Group", createdGroup });
    } catch (error) {
      console.log(error);
    }
  }

  async findAllUsers(req: Request, res: Response) {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token is missing" });
      }
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_PRIVATE_KEY || ACCESS_TOKEN
      ) as userPayload;
      const userId = decoded.id;
      const getusers = await this.ChatServices.getUserforGroup(userId);
      res.status(200).json({ message: "Users found", getusers });
    } catch (error) {
      console.log(error);
    }
  }

  async getNotifications(req: Request, res: Response) {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
          return res
            .status(401)
            .json({ message: "Unauthorized: Token is missing" });
        }
        const decoded = jwt.verify(
          token,
          process.env.ACCESS_TOKEN_PRIVATE_KEY || ACCESS_TOKEN
        ) as userPayload;
        const userId = decoded.id;
      const notifications = await this.ChatServices.getAllNotifications(userId);
      res.status(200).json({ message: "get all notifications", notifications });
    } catch (error) {
      console.log(error);
    }
  }

  async findAllFollowers(req: Request, res: Response) {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token is missing" });
    }
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_PRIVATE_KEY || ACCESS_TOKEN
    ) as userPayload;
    const userId = decoded.id;
    const followers = await this.ChatServices.getAllFollowers(userId);
    res.status(200).json({ message: "Get all followers", followers });
  }

  async getUserDetails(req: Request, res: Response) {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token is missing" });
      }
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_PRIVATE_KEY || ACCESS_TOKEN
      ) as userPayload;
      const userId = decoded.id;
      res.status(200).json({ message: "userId get", userId });
    } catch (error) {
      console.log(error);
    }
  }

  async blockUserStatus(req: Request, res: Response) {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token is missing" });
      }
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_PRIVATE_KEY || ACCESS_TOKEN
      ) as userPayload;
      const userId = decoded.id;
      const getStatus = await this.ChatServices.getUserBlockStatus(userId);
      res.status(200).json({ message: "Updated status", getStatus });
    } catch (error) {
      console.log(error);
    }
  }

  async followuser(req: Request, res: Response) {
    try {
      const { userId, LoguserId } = req.body;

      const addFollower = await this.ChatServices.AddToFollowers(
        userId,
        LoguserId
      );

      console.log(addFollower, "status00000000000000000000");

      res.status(200).json({ message: "followed users", addFollower });
    } catch (error) {
      console.log(error);
    }
  }

  // async groupAddChat(req: Request, res: Response) {
  //   try {
  //     const { chatId } = req.body;
  //     const token = req.header("Authorization")?.split(" ")[1];
  //     if (!token) {
  //       return res
  //         .status(401)
  //         .json({ message: "Unauthorized: Token is missing" });
  //     }
  //     const decoded = jwt.verify(
  //       token,
  //       process.env.ACCESS_TOKEN_PRIVATE_KEY || ACCESS_TOKEN
  //     ) as userPayload;
  //     const userId = decoded.id;

  //     if (!chatId) {
  //       console.log("Chat id not found");
  //       return res.status(400).send("Chat id not found");
  //     }
  //     if (!userId) {
  //       throw new Error("User is not authenticated");
  //     }
  //     console.log(chatId, "chat id");
  //     console.log(userId, "user id");

  //     const fullChat = await this.ChatServices.SendGroupId(userId, chatId);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  async accessgroupChat(req: Request, res: Response) {
    const { chatId } = req.body;
    if (!chatId) {
      console.log("Chat id not found");
      return res.status(400).send("Chat id not found");
    }
    const fullChat = await this.ChatServices.getAccessgroupChat(chatId);
    return res
      .status(200)
      .json({ message: "Chat created succesfully", fullChat });
  }

  async accessChat(req: Request, res: Response) {
    const { chatId } = req.body;
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token is missing" });
    }
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_PRIVATE_KEY || ACCESS_TOKEN
    ) as userPayload;
    const userId = decoded.id;

    if (!chatId) {
      console.log("Chat id not found");
      return res.status(400).send("Chat id not found");
    }
    if (!userId) {
      throw new Error("User is not authenticated");
    }

    const fullChat = await this.ChatServices.getAccessChat(userId, chatId);

    return res
      .status(200)
      .json({ message: "Chat created succesfully", fullChat });
  }

  async fetchChat(req: Request, res: Response) {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token is missing" });
      }
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_PRIVATE_KEY || ACCESS_TOKEN
      ) as userPayload;
      const userId = decoded.id;
      if (!userId) {
        return res.status(400).send("User is not authenticated");
      }
      const result = await this.ChatServices.getAllChats(userId);
      res.status(200).send(result);
    } catch (error) {
      res.status(400).send("Error fetching chats");
    }
  }

  async createGroupChat(req: Request, res: Response) {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token is missing" });
      }
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_PRIVATE_KEY || ACCESS_TOKEN
      ) as userPayload;
      const userId = decoded.id;
      if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "please fill all the field" });
      }

      var users = JSON.parse(req.body.users);
      if (users.length < 2) {
        return res.status(400).send({
          message: "More than 2 users is required for create a group",
        });
      }

      const userData = await UserSchemadata.findById(userId).select(
        "-password"
      );

      users.push(userData);

      try {
        const groupChat = await ChatSchemamodel.create({
          chatName: req.body.name,
          users: users,
          isGroupchat: true,
          groupAdmin: userData,
        });

        const fullGroupChat = await ChatSchemamodel.findOne({
          _id: groupChat._id,
        })
          .populate("users", "-password")
          .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      res.status(400);
      throw new Error("error ");
    }
  }

  async renameGroup(req: Request, res: Response) {
    const { chatId, chatName } = req.body;

    const renamed = await ChatSchemamodel.findByIdAndUpdate(
      chatId,
      { chatName: chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!renamed) {
      throw new Error("Chat not found");
    } else {
      res.json(renamed);
    }
  }

  async removeFromGroup(req: Request, res: Response) {
    const { chatId, userId } = req.body;

    // check if the requester is admin

    const removed = await ChatSchemamodel.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(removed);
    }
  }

  async addToGroup(req: Request, res: Response) {
    const { chatId, userId } = req.body;
    const added = await ChatSchemamodel.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!added) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(added);
    }
  }
}

export default ChatController;
