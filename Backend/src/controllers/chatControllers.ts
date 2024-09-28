import { Request, Response } from "express";
import ChatSchemamodel from "../model/ChatModel";
import ChatServices from "../servises/Chatservises";
import UserSchemadata from "../model/userModel";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN } from "../config/JWT";
import { userPayload } from "../interface/userInterface/userPayload";
class ChatController {
  constructor(private ChatServices: ChatServices) {}

  async getAllUser(req: Request, res: Response) {
    try {
      const userId = (req as any).userdata.id;
     const data = await this.ChatServices.getOtherusers(userId);
     if(data){
     res.json(data);
     }
    } catch (error) {
      console.log(error);
    }
  }

  async accessChat(req: Request, res: Response) {
    const { chatId } = req.body;
    const userId = (req as any).userdata.id;
    if (!chatId) {
      console.log("Chat id not found");
      return res.status(400).send("Chat id not found");
    }
    if (!userId) {
      throw new Error("User is not authenticated");
    }
    console.log(chatId, "chat id");
    console.log(userId, "user id");

    const fullChat = await this.ChatServices.getAccessChat(userId, chatId);

    return res
      .status(200)
      .json({ message: "Chat created succesfully", fullChat });
  }

  async fetchChat(req: Request, res: Response) {
    try {
      const userId = (req as any).userdata.id;
      if (!userId) {
        return res.status(400).send("User is not authenticated");
      }
      const result = await this.ChatServices.getAllChats(userId);
      // const chats = await ChatSchemamodel.find({
      //   users: { $elemMatch: { $eq: userId } },
      // })
      //   .populate("users", "-password")
      //   .populate("groupAdmin", "-password")
      //   .populate("latestMessage")
      //   .sort({ updatedAt: -1 });

      // const result = await UserSchemadata.populate(chats, {
      //   path: "latestMessage.sender",
      //   select: "name pic email",
      // });
      res.status(200).send(result);
    } catch (error) {
      res.status(400).send("Error fetching chats");
    }
  }

  async createGroupChat(req: Request, res: Response) {
    try {
      const userId = (req as any).userdata.id;

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
