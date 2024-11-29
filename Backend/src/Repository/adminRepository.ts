import { IUser, ReportedPost } from "../Entities/Userentities";
import { Posts } from "../Entities/Postentities";
import newspostSchemadata from "../Model/Newsmodal";
import UserSchemadata from "../Model/Usermodel";
import cloudinary from "../Config/Cloudinaryconfig";
import {
  ICounts,
  Ipostcount,
  RecentPosts,
} from "../Types/Servicetype/PostInterface";
import { ParsedQs } from "qs";
import { IAdminReposityory } from "../Interface/Admin/AdminRepository";
import mongoose from "mongoose";

class adminRepository implements IAdminReposityory {
  async findAdminbyemail(email: string): Promise<IUser | null> {
    const finduser = await UserSchemadata.findOne({ email }).exec();
    if (!finduser || !finduser.isAdmin) {
      throw new Error("User not found or not an admin");
    }
    return finduser;
  }

  async findTotalReportUsers(): Promise<number | undefined> {
    try {
      const countReportUsers = await UserSchemadata.find(
        {
          ReportUser: { $exists: true, $not: { $size: 0 } },
        },
        { ReportUser: 1 }
      ).countDocuments();
      return countReportUsers;
    } catch (error) {
      console.log(error);
    }
  }

  async findAllReportUsers(
    page: number,
    limit: number,
    search: string | unknown
  ): Promise<IUser[] | undefined> {
    try {
      const offset = (page - 1) * limit;
      return UserSchemadata.find(
        {
          ReportUser: { $exists: true, $not: { $size: 0 } },
        },
        { ReportUser: 1 }
      )
        .populate("ReportUser.userId")
        .skip(offset)
        .limit(limit)

        .exec();
    } catch (error) {
      console.log(error);
    }
  }

  async getTotalReportedPostUsers(): Promise<number | undefined> {
    try {
      const totalReports = await UserSchemadata.countDocuments({
        ReportPost: { $exists: true, $not: { $size: 0 } },
      });

      return totalReports;
    } catch (error) {
      console.log(error);
    }
  }

  async findReportPost(page: number, limit: number): Promise<IUser[]> {
    try {
      const offset = (page - 1) * limit;
      return UserSchemadata.find(
        {
          ReportPost: { $exists: true, $not: { $size: 0 } },
        },
        { _id: 1, name: 1, ReportPost: 1 }
      )
        .populate("ReportPost.postId")
        .skip(offset)
        .limit(limit)
        .exec();
    } catch (error) {
      console.error("Error fetching reported posts:", error, { page, limit });
      throw new Error("Failed to fetch reported posts");
    }
  }

  async countAllPost(search: string | unknown): Promise<number | undefined> {
    try {
      const query = search
        ? {
            $or: [
              { description: { $regex: search, $options: "i" } },
              { "user.name": { $regex: search, $options: "i" } },
            ],
          }
        : {};
      const totalpost = await newspostSchemadata.countDocuments(query);

      return totalpost;
    } catch (error) {
      console.log(error);
    }
  }

  async findPost(
    page: number,
    limit: number,
    search: string | unknown
  ): Promise<{ posts: Posts[] }> {
    const offset = (page - 1) * limit;
    const query = search
      ? {
          $or: [
            { description: { $regex: search, $options: "i" } },
            { "user.name": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const postsinfo = await newspostSchemadata
      .find(query)
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit)
      .populate("user", "name email");

    return {
      posts: postsinfo,
    };
  }
  async findThePostToDelete(
    id: string
  ): Promise<{ images: string[]; videos: string[] }> {
    try {
      const FindPost = await newspostSchemadata.findById(id).exec();
      const images = Array.isArray(FindPost?.image) ? FindPost.image : [];
      const videos = Array.isArray(FindPost?.videos) ? FindPost.videos : [];

      return {
        images: Array.isArray(FindPost?.image) ? FindPost.image : [],
        videos: Array.isArray(FindPost?.videos) ? FindPost.videos : [],
      };
    } catch (error) {
      console.error("Error finding the post to delete:", error);
      throw new Error("Failed to find the post");
    }
  }
  async deletePostFromUsers(postId: string): Promise<void> {
    try {
      console.log(postId, "delete from user 333333333333333333333333333");

      const objectId = new mongoose.Types.ObjectId(postId);

      const deleted = await UserSchemadata.updateMany(
        { "ReportPost._id": objectId }, 
        { $pull: { ReportPost: { _id: objectId } } } 
      );

      if (deleted.modifiedCount > 0) {
        console.log(
          "Post successfully removed from users' ReportPost.",
          deleted
        );
      } else {
        console.log("No matching post found in ReportPost.");
      }
    } catch (error) {
      console.error("Error finding the post to delete:", error);
      throw new Error("Failed to delete the post from users' ReportPost");
    }
  }

  async deleteReportedPost(id: string): Promise<void> {
    try {
      const deletePostdata = await newspostSchemadata.findByIdAndDelete(id);
      if (!deletePostdata) {
        throw new Error("Post is not deleted");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async checkPostStatus(id: string): Promise<boolean | undefined> {
    try {
      const Findthepost = await newspostSchemadata.findById(id);
      return Findthepost?.BlockPost;
    } catch (error) {
      console.log(error);
    }
  }

  async deletePost(
    id: string,
    isblock: boolean | undefined
  ): Promise<boolean | undefined> {
    try {
      const isBlocked = await newspostSchemadata.findByIdAndUpdate(id, {
        BlockPost: !isblock,
      });
      return isBlocked?.BlockPost;
    } catch (error) {
      console.log(error);
    }
  }
  async getTotalUsers(): Promise<number> {
    try {
      return await UserSchemadata.countDocuments();
    } catch (error) {
      console.error("Error fetching total users:", error);
      throw new Error("Error fetching total users");
    }
  }
  async getTotalPosts(): Promise<number> {
    try {
      return await newspostSchemadata.countDocuments();
    } catch (error) {
      console.error("Error fetching total posts:", error);
      throw new Error("Error fetching total posts");
    }
  }

  async findallpostanduser(): Promise<any[] | unknown> {
    try {
      const recentPosts = await newspostSchemadata.aggregate([
        {
          $project: {
            description: 1,
            likeCount: 1,
            totalLikes: { $size: "$likes" },
            totalComments: { $size: "$comments" },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $limit: 5,
        },
      ]);

      return {
        recentPosts,
      };
    } catch (error) {
      console.error("Error fetching users and posts:", error);
      throw new Error("Error fetching data");
    }
  }

  async getUsersCount(): Promise<{ userscount: number | undefined }> {
    try {
      const Alluserscount = await UserSchemadata.countDocuments();
      if (!Alluserscount) {
        throw new Error("No user found");
      }
      return { userscount: Alluserscount };
    } catch (error) {
      console.error(error);
      return { userscount: undefined };
    }
  }

  async findUsers(
    page: number,
    limit: number,
    search: string | string[] | ParsedQs | ParsedQs[] | undefined
  ): Promise<{ userinfo: IUser[] }> {
    try {
      const skip = (page - 1) * limit;
      const searchterm = search;
      const query = searchterm
        ? {
            $or: [
              { name: { $regex: searchterm, $options: "i" } },
              { email: { $regex: searchterm, $options: "i" } },
            ],
          }
        : {};
      const userDatas = await UserSchemadata.find(query)
        .skip(skip)
        .limit(limit);
      return {
        userinfo: userDatas,
      };
    } catch (error) {
      console.log(error);
      return {
        userinfo: [],
      };
    }
  }

  async checkUserBlockStatus(
    userid: string,
    isActive: boolean
  ): Promise<boolean | undefined> {
    const userdata = await UserSchemadata.findById(userid);
    return userdata?.isActive;
  }

  async ModifyUsersblock(
    userid: string,
    isActive: boolean
  ): Promise<boolean | undefined> {
    const userdata = await UserSchemadata.findByIdAndUpdate(userid, {
      isActive: !isActive,
    });
    return userdata?.isActive;
  }
}
export default adminRepository;
