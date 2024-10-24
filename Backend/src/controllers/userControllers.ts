import userServises from "../Servises/Userservises";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { userPayload } from "../Interface/userInterface/Userpayload";
import dotenv from "dotenv";
import { ACCESS_TOKEN } from "../Config/Jwt";
import cloudinary from "../Utils/Cloudinary";
import fs from "fs";
import { log } from "winston";
import checkUpcomingBirthdays from "../Notifications/Notifications";
// import { generateOtp, sendVerifyMail } from "../utils/mail";
// import { log } from "console";
// import { Posts } from "../Entities/Userentities";

dotenv.config();
class UserController {
  constructor(private userService: userServises) {}

  async userRegister(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const useremail = req.body.email;
      let usertemp = await this.userService.createUser(userData);
      if (usertemp) {
        res.status(200).json({ message: "OTP Send Successfully", useremail });
      } else {
        throw new Error("Something wrong");
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Email already exist.") {
          res.status(409).json({ message: error.message });
        }
        if (error.message) {
          res.status(400).json({ message: error.message });
        }
      }
    }
  }

  async getUserInfos(req: Request, res: Response) {
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
      console.log(userId, "user id get her");

      const getUserdata = await this.userService.getUserInfoses(userId);

      return res
        .status(200)
        .json({ message: "get User data", userDetails: getUserdata });
    } catch (error) {
      console.log(error);
    }
  }

  async userLogin(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      let userdata = await this.userService.verifyUser(userData);
      if (userdata) {
        let refreshtok = userdata.refreshToken;
        let accesstok = userdata.accessToken;

        res
          .status(200)
          .json({ message: "user Login succesfully", accesstok, refreshtok });
      } else {
        throw new Error("No user found");
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Wrong password") {
          res.status(409).json({ message: error.message });
        } else if (error.message === "User does not exist") {
          res.status(400).json({ message: error.message });
        } else {
          console.error(`Invalid password ${error.message}`);
          res.status(500).json({ message: error.message });
        }
      }
    }
  }

  async verifymailforget(req: Request, res: Response): Promise<void> {
    try {
      const email = req.body.email;
      const userData = await this.userService.verifymail(email);
      const emailnew = userData.email;
      res.status(200).json({ message: "confirm user", email: emailnew });
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        if (error.message === "No user found") {
          res.status(400).json({ message: error.message });
        }
        if (error.message) {
          res.status(409).json({ message: error.message });
        }
      }
    }
  }

  async getNotifications(req:Request,res:Response){
    console.log('hahahahaahhhaha');
    
      await checkUpcomingBirthdays()
  }

  async forgetotp(req: Request, res: Response): Promise<void> {
    try {
      const { otp, email } = req.body;
      if (!otp || !email) {
        throw new Error("No email or otp");
      }
      let otpbody = parseInt(otp);
      await this.userService.verifyotp(otpbody, email);
      res.status(200).json({ message: "confirm user" });
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        if (error.message === "No user found") {
          res.status(400).json({ message: error.message });
        }
        if (error.message) {
          res.status(409).json({ message: error.message });
        }
      }
    }
  }

  async LikePost(req: Request, res: Response) {
    try {
      const { postId, userId } = req.body;
      if (!postId) {
        res.status(400).json({ message: "PostId is required" });
      }
      const getupdate = await this.userService.passLikePostID(postId, userId);
      res.status(200).json({ message: "Post liked succesfully" });
    } catch (error) {
      console.log(error);
    }
  }

  async ReportTheUser(req: Request, res: Response) {
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
      const logeduserId = decoded.id;

      // const logeduserId = (req as any).userdata.id;
      const { userID, text } = req.body;
      const getUsers = await this.userService.sendReportReason(
        userID,
        text,
        logeduserId
      );
      res.status(200).json({ message: "user Reported succesfully" });
    } catch (error) {
      console.log(error);
    }
  }

  async getReplyComments(req: Request, res: Response) {
    try {
      const getReplys = await this.userService.getAllReplyhere();
      res
        .status(200)
        .json({ message: "get all reply comments", posts: getReplys });
    } catch (error) {
      console.log(error);
    }
  }

  async replycommentPost(req: Request, res: Response) {
    try {
      const { commentId, replyContent, postId, userId, username } = req.body;

      if (!commentId || !replyContent || !postId || !username) {
        throw new Error("No id or Comment");
      }
      await this.userService.replyComments(
        commentId,
        replyContent,
        postId,
        userId,
        username
      );
      res.status(200).json({ message: "updated succefully" });
    } catch (error) {
      console.log(error);
    }
  }

  async commentPost(req: Request, res: Response) {
    try {
      const { postId, userId, comment } = req.body;
      if (!postId || !userId || !comment) {
        res.status(400).json({ message: "Id or message not get" });
      }
      const getupdate = await this.userService.passCommentPostID(
        postId,
        userId,
        comment
      );
      res.status(200).json({ message: "Post Commented succesfully" });
    } catch (error) {
      console.log(error);
    }
  }

  async getIduser(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const decoded = jwt.verify(id, ACCESS_TOKEN) as userPayload;
      console.log(
        decoded.id,
        "userd id get here......................................"
      );

      res.status(200).json({ message: "user id get", userId: decoded.id });
    } catch (error) {}
  }

  async ReportPost(req: Request, res: Response) {
    try {
      const { postId, text, userId } = req.body;
      console.log(postId, "get post id");
      if (!postId) {
        res.status(400).json({ message: "PostId is required" });
      }
      const getupdate = this.userService.passPostID(postId, text, userId );
      res.status(200).json({ message: "Post Reported succesfully" });
    } catch (error) {
      console.log(error);
    }
  }

  async setforgetpass(req: Request, res: Response): Promise<void> {
    console.log("reched here.........................");

    const { email, password } = req.body;

    console.log(email, password);

    if (!password || !email) {
      res.status(400).json({ message: "Password required" });
      return;
    }
    await this.userService.Changepassword(email, password);

    res.status(200).json({ message: "Password Changed successfully" });
  }

  async userCheckOtp(req: Request, res: Response): Promise<void> {
    try {
      const { otp, email } = req.body;
      if (!otp || !email) {
        res.status(400).json({ message: "OTP are required" });
        return;
      }
      let otpbody = parseInt(otp);
      let userOtpverified = await this.userService.CheckOtp(otpbody, email);
      if (userOtpverified) {
        console.log(userOtpverified.accessToken, "bakcend tock");
        console.log(userOtpverified.refreshToken, "refresh tock");
        res.status(200).json({
          message: "OTP verified successfully",
          accessToken: userOtpverified.accessToken,
          refreshToken: userOtpverified.refreshToken,
        });
      } else {
        res.status(401).json({ message: "OTP is not matching" });
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  async resendotp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ message: "OTP are required" });
        return;
      }
      await this.userService.sendResendotp(email);
      res.status(200).json({ message: "resend otp successfully" });
    } catch (error) {
      console.log(error);
    }
  }

  async userProfile(req: Request, res: Response) {
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
      console.log(userId, "user id get her");
      let getdetails = await this.userService.userIDget(userId);
      if (getdetails) {
        res.status(200).json({ message: "User Profile found", getdetails });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const postId = req.params.id;

      if (!postId) {
        res.status(400).json({ message: "Invalid post ID" });
        return;
      }

      const deletedPost = await this.userService.sendPostid(postId);
      res
        .status(200)
        .json({ message: "Post deleted successfully", deletedPost });
    } catch (error) {
      console.log(error);
    }
  }

  async getAllPost(req: Request, res: Response) {
    try {
      const getAlldetails = await this.userService.getpostdetails();

      if (getAlldetails) {
        res.status(200).json({ message: "getAllpostdetails", getAlldetails });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async allUsers(req: Request, res: Response) {
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
      console.log(userId, "user id get her");
      const searchUser = req.query.search;
      if (!searchUser) {
        throw new Error("No search ID");
      }
      let SearchedUsers = await this.userService.findSearchedusers(
        searchUser,
        userId
      );
      if (SearchedUsers) {
        res.status(200).json({ message: "search users", SearchedUsers });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getuserPost(req: Request, res: Response) {
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
      let getdetails = await this.userService.postuserIDget(userId);
      if (getdetails) {
        res.status(200).json({ message: "User Post found", getdetails });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updateProfile(req:Request, res: Response): Promise<void> {
    try {

      const { name, password, newpassword, userId } = req.body;
      if (!req.file) {
        res.status(400).json({ error: "File is missing" });
      }
      const file = req.file as Express.Multer.File;
      const result = await cloudinary.uploader.upload(file.path);
      const imageUrl = result.secure_url;
      if (!name || !password || !newpassword || !userId) {
        throw new Error("Data is missing");
      }

      const userData = await this.userService.userDetailsdata(
        name,
        password,
        newpassword,
        imageUrl,
        userId,
      );

      if (userData) {
        res.status(200).json({ message: "userupdated successfully" });
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        if (error.message) {
          res.status(400).json({ message: error.message });
        } else {
          res.status(409).json({ message: error.message });
        }
      }
    }
  }

  async editPost(req: Request, res: Response): Promise<void> {
    try {
      const { content, postId } = req.body;
      console.log(postId, "post id");
      if (!content || !postId) {
        res.status(400).json({ message: "Content or user ID is missing" });
      }

      // Files uploaded (images and videos)
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

      // Wait for all uploads to complete
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
      const userData = await this.userService.editDetailsdata(
        content,
        postId,
        imageUrls,
        videoUrls
      );

      if (userData) {
        res
          .status(200)
          .json({ message: "Post updated successfully", data: userData });
      } else {
        res.status(500).json({ message: "Failed to save post" });
      }
    } catch (error) {
      console.error("Error during post creation:", error);
      res
        .status(500)
        .json({ message: "Server error during post creation", error });
    }
  }
  unlinkFiles = (files: Express.Multer.File[]) => {
    files.forEach((file) => {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(`Failed to delete file ${file.path}:`, err);
        } else {
          console.log(`Successfully deleted file ${file.path}`);
        }
      });
    });
  };

  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const { content, userId } = req.body;
      if (!content || !userId) {
        res.status(400).json({ message: "Content or user ID is missing" });
        return;
      }

      const files = req.files as {
        images?: Express.Multer.File[];
        videos?: Express.Multer.File[];
      };

      // Handle image upload to Cloudinary
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

      // Wait for all uploads to complete
      const uploadedImages = await Promise.all(imageUploadPromises);
      const uploadedVideos = await Promise.all(videoUploadPromises);

      // Extract Cloudinary URLs for images and videos, default to empty arrays if no uploads
      const imageUrls: string[] =
        uploadedImages.length > 0
          ? uploadedImages.map((upload) => upload.secure_url)
          : [];
      const videoUrls: string[] =
        uploadedVideos.length > 0
          ? uploadedVideos.map((upload) => upload.secure_url)
          : [];

      // Save post data to the database with images and videos if they exist
      const userData = await this.userService.postDetailsdata(
        userId,
        content,
        imageUrls,
        videoUrls
      );

      if (userData) {
        res
          .status(200)
          .json({ message: "Post uploaded successfully", data: userData });
      } else {
        res.status(500).json({ message: "Failed to save post" });
      }

      if (files?.images) {
        this.unlinkFiles(files.images);
      }
      if (files?.videos) {
        this.unlinkFiles(files.videos);
      }
    } catch (error) {
      console.error("Error during post creation:", error);
      res
        .status(500)
        .json({ message: "Server error during post creation", error });
    }
  }
}

export default UserController;
