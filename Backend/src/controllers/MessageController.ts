import { Request, Response } from "express";
import MessageServices from "../Servises/Messageservises";
import jwt from "jsonwebtoken";
import cloudinary from "../Utils/Cloudinary";
import { ACCESS_TOKEN } from "../Config/Jwt";
import { userPayload } from "../Entities/UserTypes";
// import messageSchemaModel from "../Model/Messagemodel";
// import UserSchemadata from "../Model/Usermodel";
// import ChatSchemamodel from "../Model/Chatmodel";
// import { ACCESS_TOKEN } from "../Config/Jwt";
// import { userPayload } from "../Interface/userInterface/Userpayload";
// import fs from "fs";

class MessageControllers {
  constructor(private messageservise: MessageServices) {}
  async sendMessage(req: Request, res: Response){
    try {
     const token = req.header("Authorization")?.split(" ")[1];
     if (!token) {
       return res.status(401).json({ message: "Unauthorized: Token is missing" });
     }
     const decoded = jwt.verify(
       token,
       process.env.ACCESS_TOKEN_PRIVATE_KEY || ACCESS_TOKEN
     ) as userPayload;
     const userId = decoded.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
      }
      const { content, chatId } = req.body;

      const files = req.files as {
        images?: Express.Multer.File[];
        videos?: Express.Multer.File[];
      };
      const imageUploadPromises = files?.images
        ? files.images.map((file) =>
            cloudinary.uploader.upload(file.path, { resource_type: "image" })
          )
        : [];
      const videoUploadPromises = files?.videos
        ? files.videos.map((file) =>
            cloudinary.uploader.upload(file.path, { resource_type: "video" })
          )
        : [];
      const uploadedImages = await Promise.all(imageUploadPromises);
      const uploadedVideos = await Promise.all(videoUploadPromises);

      const imageUrls: string[] =
        uploadedImages.length > 0
          ? uploadedImages.map((upload) => upload.secure_url)
          : [];
      const videoUrls: string[] =
        uploadedVideos.length > 0
          ? uploadedVideos.map((upload) => upload.secure_url)
          : [];

      const message = await this.messageservise.sendAllmessages(
        userId,
        content,
        chatId,
        imageUrls,
        videoUrls
      );
      res.status(200).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  }

  // async blockUserStatus(req: Request, res: Response) {
  //   try {
  //     console.log("1111111111111111111111111");
  //     const userId = (req as any).userdata.id;

  //     console.log(userId, "user id get######################");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }


  // async getNotifications(req:Request,res:Response){
  //     try {
  //       console.log("get notificationssssssssssssssss1111111111111111111111111111111111");
      
  //     } catch (error) {
  //       console.log(error);
        
  //     }
  // }

  async blockUserNow(req: Request, res: Response) {
    try {
      const { userId, LogedUserId } = req.body;
      console.log(userId, "userId");
      console.log(LogedUserId, "LogedUserId");

      if (!userId || !LogedUserId) {
        throw new Error("no users found");
      }

      const userStatus = await this.messageservise.blockUserhere(
        userId,
        LogedUserId
      );

      res.status(200).json({ message: "User blocked", userStatus });
    } catch (error) {
      console.log(error);
    }
  }

  async getUserInfo(req: Request, res: Response) {
    try {
      
      const userInfo = req.params.chatId; 
      
      const userinfo = await this.messageservise.getUserInfomation(userInfo);
       res.status(200).json({ message: "Get user id", userinfo });
    } catch (error) {
      console.log(error);
    }
  }

  async getId(req: Request, res: Response) {
    try {
      const getTocken = req.params.userTocken;
      const decoded = jwt.verify(getTocken, "key_for_accesst") as {
        id: string;
      };
      const userId = decoded.id;
      res.status(200).json({ message: "User id found", userId });
    } catch (error) {
      console.log(error);
    }
  }

  async allChats(req: Request, res: Response) {
    try {
      try {
        const chatid = req.params.chatId;
        const Allmessage = await this.messageservise.findAllmessages(chatid);
        res.status(200).json({ message: "Get all messages", Allmessage });
      } catch (error) {
        res.status(400);
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default MessageControllers;
