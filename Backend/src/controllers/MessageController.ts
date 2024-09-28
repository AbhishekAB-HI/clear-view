import { Request, Response } from "express";
import MessageServices from "../servises/messageServises";
import messageSchemaModel from "../model/messageModel";
import UserSchemadata from "../model/userModel";
import jwt from "jsonwebtoken";
import ChatSchemamodel from "../model/ChatModel";
import { ACCESS_TOKEN } from "../config/JWT";
import { userPayload } from "../interface/userInterface/userPayload";
import cloudinary from "../utils/Cloudinary";
import fs from "fs";




// const uploadToCloudinary = (filePath: string, folder: string): Promise<any> => {
//   return new Promise((resolve, reject) => {
//     cloudinary.v2.uploader.upload(
//       filePath,
//       { folder }, // Optional: you can organize your media into specific folders
//       (error: any, result: any) => {
//         if (error) reject(error);
//         else resolve(result);
//       }
//     );
//   });
// };

class MessageControllers {
  constructor(private messageservise: MessageServices) {}

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userdata.id;
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
       console.log(imageUrls, "Images URLs1111111111111");
       console.log(videoUrls, "Videos URLs");

    const message =await this.messageservise.sendAllmessages(
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

  async getUserInfo(req: Request, res: Response) {
    try {
      const userInfo = req.params.chatId;
      const userinfo = await this.messageservise.getUserInfomation(userInfo);
      // const userinfo = await UserSchemadata.findById(userInfo);
      console.log(userinfo, "userdata");
      res.json(userinfo);
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
      res.json(userId);
    } catch (error) {
      console.log(error);
    }
  }

  async allChats(req: Request, res: Response) {
    try {
      try {
      const chatid = req.params.chatId;
      const messages = await this.messageservise.findAllmessages(chatid);
        // const message = await messageSchemaModel.find({ chat: req.params.chatId }).populate("sender", "name image email").populate("chat");
        res.json(messages);
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
