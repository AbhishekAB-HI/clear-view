import userServises from "../Services/Userservices";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { userPayload } from "../Types/Commontype/TockenInterface";
import dotenv from "dotenv";
import { ACCESS_TOKEN } from "../Config/Jwt";
import cloudinary from "../Config/Cloudinaryconfig";
import fs from "fs";
import {  generateRefreshToken } from "../Utils/Jwt";
import { IUserServices } from "../Interface/Users/UserServices";

dotenv.config();

class UserController {
  constructor(private userService: IUserServices) {}

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
        .json({
          message: "get User data",
          userDetails: getUserdata,
          userIdget: userId,
        });
    } catch (error) {
      console.log(error);
    }
  }

  async userLastseen(req: Request, res: Response) {
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
      const userinfo = await this.userService.updateLastseen(userId);
      if (userinfo) {
        res.status(200).json({ message: "lastTime updated" });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
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
      const emailnew = userData?.email;
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

  async getBlockedUsers(req: Request, res: Response) {
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

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 2;

      const FindUsers = await this.userService.findBlockedUsers(
        userId,
        page,
        limit
      );

      if (!FindUsers?.Allusers || !FindUsers.totalblockuser) {
        return res
          .status(200)
          .json({
            message: "Get Blocked users",
            Allusers: [],
            totalblockuser: 0,
          });
      }

      const { Allusers, totalblockuser } = FindUsers;
      res
        .status(200)
        .json({ message: "Get Blocked users", Allusers, totalblockuser });
    } catch (error) {
      console.log(error);
    }
  }

  async LikePost(req: Request, res: Response) {
    try {
      const { postId, userId } = req.body;
      if (!postId) {
        res.status(400).json({ message: "PostId is required" });
      }
      const getupdate = await this.userService.passLikePostID(postId, userId);
      res.status(200).json({ message: "Post liked succesfully", getupdate });
    } catch (error) {
      console.log(error);
    }
  }

  async getProfileview(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 2;
      const { userid } = req.query;
      const getUserProfile = await this.userService.passProfileid(
        userid,
        page,
        limit
      );
      if (!getUserProfile || !getUserProfile.userinfo) {
        throw new Error("No user details found");
      }

      const { userinfo, postinfo, totalpost } = getUserProfile;

      res.status(200).json({
        message: "Get user Profile",
        userinfo,
        postinfo,
        totalpost,
      });
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
      const { userId, text } = req.body;
      console.log(
        userId,
        "userid to report1111111111111111111111111111111111111"
      );
      const getUsers = await this.userService.sendReportReason(
        userId,
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

      res.status(200).json({ message: "user id get", userId: logeduserId });
    } catch (error) {}
  }

  async ReportPost(req: Request, res: Response) {
    try {
      const { postId, text, userId } = req.body;
      console.log(postId, "get post id");
      if (!postId) {
        res.status(400).json({ message: "PostId is required" });
      }
      const getupdate = this.userService.passPostID(postId, text, userId);

      res.status(200).json({ message: "Post Reported succesfully" });
    } catch (error) {
      console.log(error);
    }
  }

  async setforgetpass(req: Request, res: Response): Promise<void> {
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
      const { search, category, page } = req.query as unknown as {
        search?: string;
        category?: string;
        page: string | number;
      };

      const { posts, currentPage, totalPages } =
        await this.userService.getpostdetails(search, category, page);
      res.status(200).json({
        message: "getAllpostdetails",
        data: { posts, currentPage, totalPages },
      });
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 2;
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
      let getdetails = await this.userService.postuserIDget(
        userId,
        page,
        limit
      );

      if (!getdetails || !getdetails.posts || !getdetails.total) {
        throw new Error("No user details or posts get here");
      }

      const { posts, total } = getdetails;

      if (getdetails) {
        res.status(200).json({ message: "User Post found", posts, total });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async refreshTocken(req: Request, res: Response) {
    const REFRESH_TOKEN_PRIVATE_KEY = "key_for_refresht";
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh Token required" });
    }
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_PRIVATE_KEY || REFRESH_TOKEN_PRIVATE_KEY,
      (err: any, user: any) => {
        if (err) {
          return res.status(403).json({ message: "Token expired or invalid" });
        }
        const newAccessToken = generateRefreshToken({ id: user.id });
        res.json({ accessToken: newAccessToken });
      }
    );
  }

  async updatePassword(req: Request, res: Response) {
    try {
      const { userId, password, newpassword } = req.body;
      if (!userId || !password || !newpassword) {
        throw new Error("No password get here");
      }
      const userUpdate = await this.userService.PassUserDetails(
        userId,
        password,
        newpassword
      );

      res.status(200).json({ message: "Update password" });
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      res.status(400).json({ message: errorMessage });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const { name, userId } = req.body;
      if (!req.file) {
        throw new Error("File is missing");
      }
      const file = req.file as Express.Multer.File;
      const result = await cloudinary.uploader.upload(file.path);
      const imageUrl = result.secure_url;
      if (!name || !userId) {
        throw new Error("Required data is missing");
      }

      const userData = await this.userService.userDetailsdata(
        name,
        imageUrl,
        userId
      );

      if (userData) {
        res.status(200).json({ message: "userupdated successfully" });
      } else {
        res.status(400).json({ message: "Failed to update user" });
      }
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      res.status(400).json({ message: errorMessage });
    }
  }

  async editPost(req: Request, res: Response): Promise<void> {
    try {
      const unlinkFiles = (files: Express.Multer.File[]): void => {
        files.forEach((file) => {
          fs.unlink(file.path, (err) => {
            if (err) {
              console.error(`Failed to delete file: ${file.path}`, err);
            } else {
              console.log(`Successfully deleted file: ${file.path}`);
            }
          });
        });
      };

      const { content, postId } = req.body;
      if (!content || !postId) {
        res.status(400).json({ message: "Content or user ID is missing" });
      }
      const files = req.files as {
        images?: Express.Multer.File[];
        videos?: Express.Multer.File[];
      };

      // if (files?.images) {
      //   files.images.forEach((file) => {
      //     console.log("Uploaded image file:", file);
      //   });
      // } else {
      //   console.log("No images received");
      // }
      // if (files?.videos) {
      //   files.videos.forEach((file) => {
      //     console.log("Uploaded video file:", file);
      //   });
      // } else {
      //   console.log("No videos received");
      // }

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
      if (files?.images) unlinkFiles(files.images);
      if (files?.videos) unlinkFiles(files.videos);
    } catch (error) {
      console.error("Error during post creation:", error);
      res
        .status(500)
        .json({ message: "Server error during post creation", error });
    }
  }

  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const { content, userId, Category } = req.body;

      if (!content || !userId) {
        res.status(400).json({ message: "Content or user ID is missing" });
        return;
      }

      const files = req.files as {
        images?: Express.Multer.File[];
        videos?: Express.Multer.File[];
      };

      if (files?.images && files.images.length > 4) {
        res.status(400).json({ message: "Max image count is 4" });
        return;
      }

      const unlinkFiles = (files: Express.Multer.File[]): void => {
        files.forEach((file) => {
          fs.unlink(file.path, (err) => {
            if (err) {
              console.error(`Failed to delete file: ${file.path}`, err);
            } else {
              console.log(`Successfully deleted file: ${file.path}`);
            }
          });
        });
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

      const imageUrls = uploadedImages.map((upload) => upload.secure_url);
      const videoUrls = uploadedVideos.map((upload) => upload.secure_url);

      const userData = await this.userService.postDetailsdata(
        userId,
        content,
        Category,
        imageUrls,
        videoUrls
      );

      const { savePosts, postNotify } = userData;

      if (userData) {
        res.status(200).json({
          message: "Post uploaded successfully",
          userinfo: savePosts,
          postdetail: postNotify,
        });
      } else {
        res.status(500).json({ message: "Failed to save post" });
      }

      if (files?.images) unlinkFiles(files.images);
      if (files?.videos) unlinkFiles(files.videos);
    } catch (error) {
      console.error("Error during post creation:", error);
      res.status(500).json({
        message: "Server error during post creation",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default UserController;
