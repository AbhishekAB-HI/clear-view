import { log } from "console";
import userServises from "../servises/userServises";
import { Request, Response } from "express";
import { generateOtp, sendVerifyMail } from "../utils/mail";
import jwt from "jsonwebtoken";
import { userPayload } from "../interface/userInterface/userPayload";
import dotenv from "dotenv";
import { ACCESS_TOKEN } from "../config/JWT";
import cloudinary from "../utils/Cloudinary";
import { Posts } from "../entities/userEntities";

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

  async userLogin(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      let userdata = await this.userService.verifyUser(userData);
      if (userdata) {
        let refreshtok = userdata.refreshToken;
        let accesstok = userdata.accessToken;

        console.log(refreshtok, "refresh tocken.....................");
        console.log(accesstok, "access tocken.....................");

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

  async ReportPost(req: Request, res: Response) {
    try {
      const { postId } = req.body;
      console.log(postId, "get post id");
      if (!postId) {
        res.status(400).json({ message: "PostId is required" });
      }
      const getupdate = this.userService.passPostID(postId);
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

  async userProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userdata.id;
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
      const userId = (req as any).userdata.id;
      console.log(userId, "user id get her");
      const searchUser = req.query.search;
      if (!searchUser) {   
        throw new Error("No search ID");
      }
      let SearchedUsers = await this.userService.findSearchedusers(
        searchUser,
        userId
      );

      console.log(SearchedUsers,'get searched userssssss..............................');
      

      if (SearchedUsers) {
        res.status(200).json({ message: "get all users", SearchedUsers });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getuserPost(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userdata.id;
      let getdetails = await this.userService.postuserIDget(userId);
      if (getdetails) {
        res.status(200).json({ message: "User Post found", getdetails });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
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
        userId
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
      // Handle image upload to Cloudinary
      const imageUploadPromises = files?.images
        ? files.images.map((file) =>
            cloudinary.uploader.upload(file.path, { resource_type: "image" })
          )
        : [];


      // Handle video upload to Cloudinary
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

  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const { content, userId } = req.body;
      if (!content || !userId) {
        res.status(400).json({ message: "Content or user ID is missing" });
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
        res.status(200).json({ message: "Post uploaded successfully", data: userData });
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
}

export default UserController;
