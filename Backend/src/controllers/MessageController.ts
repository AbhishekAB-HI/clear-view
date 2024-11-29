import { Request, Response } from "express";
import MessageServices from "../Services/Messageservices";
import jwt from "jsonwebtoken";
import cloudinary from "../Config/Cloudinaryconfig";
import { ACCESS_TOKEN } from "../Config/Jwt";
import { userPayload } from "../Entities/UserTypes";
import { IMessageServices } from "../Interface/Messages/Messageservices";

class MessageControllers {
  constructor(private messageservise: IMessageServices) {}

  async sendMessage(req: Request, res: Response) {
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
        res.status(401).json({ message: "Unauthorized" });
      }
      const { content, chatId } = req.body;

      const files = req.files as {
        images?: Express.Multer.File[];
        videos?: Express.Multer.File[];
      };

      if (files?.images && files.images.length > 4) {
        res.status(400).json({ message: "Max image count is 4" });
        return;
      }

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

  async blockUserNow(req: Request, res: Response) {
    try {
      const { userId, LogedUserId } = req.body;
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
      const userInfo = req.params.chatid;

      const userinfo = await this.messageservise.getUserInfomation(userInfo);
      res.status(200).json({ message: "Get user id", userinfo });
    } catch (error) {
      console.log(error);
    }
  }

  async getId(req: Request, res: Response) {
    try {
      const getTocken = req.params.usertocken;
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
        const chatId = req.params.chatid;
        const Allmessage = await this.messageservise.findAllmessages(chatId);
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
