import {
  adminId,
  Admintockens,
  passwords,
} from "../Types/Servicetype/Admininterface";
import { IReportUser, IUser, ReportedPost } from "../entities/userEntities";
import { Posts } from "../entities/Postentities";
import { adminPayload } from "../Types/Commontype/TockenInterface";
// import adminRepository from "../Repository/Adminrepository";
import HashPassword from "../Utils/Hashpassword";
import { generateAdminAccessToken } from "../Utils/Jwt";
import { ICounts, Ipostcount } from "../Types/Servicetype/PostInterface";
import { ParsedQs } from "qs";
import { ObjectId } from "mongoose";
import { IAdminServices } from "../Interface/Admin/AdminServises";
import { IAdminReposityory } from "../Interface/Admin/AdminRepository";
import cloudinary from "../config/Cloudinaryconfig";

class AdminServices implements IAdminServices {
  constructor(private adminRepository: IAdminReposityory) {}

  async verifyUser(
    userdata: Partial<adminId>
  ): Promise<Admintockens | undefined> {
    if (!userdata.email || !userdata.password) {
      throw new Error("Email and password is required");
    }
    const verifyuser = await this.adminRepository.findAdminbyemail(
      userdata.email
    );
    if (verifyuser?.password) {
      const isPasswordValid = await HashPassword.comparePassword(
        userdata.password,
        verifyuser.password
      );
      if (!isPasswordValid) {
        throw new Error("Wrong password");
      }

      if (isPasswordValid) {
        const adminPayload: adminPayload = {
          id: verifyuser._id as ObjectId,
        };
        let admintocken = generateAdminAccessToken(adminPayload);
        return { admintocken: admintocken };
      }
    }
  }

  async deleteReportPost(id: string, postId: string): Promise<void> {
    try {
      const findpost = await this.adminRepository.findThePostToDelete(id);
      if (!findpost) {
        throw new Error("Post is not found");
      }
      const { images, videos } = findpost;

      console.log(images, "service image");

      if (images && images.length > 0) {
        for (const img of images) {
          await cloudinary.uploader.destroy(img);
          console.log("Image deleted from Cloudinary");
        }
      }

      if (videos && videos.length > 0) {
        for (const video of videos) {
          await cloudinary.uploader.destroy(video);
          console.log("video deleted from Cloudinary");
        }
      }

      const deletefromUserPostReports =
        await this.adminRepository.deletePostFromUsers(postId);
      const deletePost = await this.adminRepository.deleteReportedPost(id);
    } catch (error) {
      console.log(error);
    }
  }

  async deletePost(id: string): Promise<boolean | undefined> {
    try {
      const findpost = await this.adminRepository.checkPostStatus(id);
      if (findpost) {
        const deletePost = await this.adminRepository.deletePost(id, findpost);
        return deletePost;
      } else {
        const deletePost = await this.adminRepository.deletePost(id, findpost);
        return deletePost;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getAllReportUsers(
    page: number,
    limit: number,
    search: string | unknown
  ): Promise<{ Reports: IReportUser[]; totalcount: number } | undefined> {
    try {
      const foundedusers = await this.adminRepository.findAllReportUsers(
        page,
        limit,
        search
      );

      const reports = foundedusers
        ?.flatMap((user) =>
          user?.ReportUser?.map((report) => ({
            userId: report.userId,
            reportReason: report.reportReason,
            Reportedby: report.Reportedby,
            userimage: report.userimage,
            username: report.username,
          }))
        )
        .filter((report): report is IReportUser => report !== undefined);
      if (!reports) {
        return { Reports: [], totalcount: 0 };
      }
      const TotalReportusers =
        await this.adminRepository.findTotalReportUsers();

      return {
        Reports: reports,
        totalcount: TotalReportusers || 0,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getAllReportedpost(
    page: number,
    limit: number
  ): Promise<{ posts: ReportedPost[] | any; total: number }> {
    const reportedPostsData = await this.adminRepository.findReportPost(
      page,
      limit
    );

    const postReports = reportedPostsData
      .flatMap((user) =>
        user.ReportPost?.map((report) => ({
          _id: report._id,
          postId: report.postId,
          postcontent: report.postcontent,
          postimage: report.postimage,
          postVideo: report.postVideo,
          postreportReason: report.postreportReason,
          postedBy: report.postedBy,
          reportedBy: report.reportedBy,
        }))
      )
      .filter(Boolean);

    const totalReports = await this.adminRepository.getTotalReportedPostUsers();

    return {
      posts: postReports || [],
      total: totalReports || 0,
    };
  }

  async getAllpost(
    page: number,
    limit: number,
    search: string | unknown
  ): Promise<{ posts: Posts[]; total: number }> {
    const getAllposts = await this.adminRepository.findPost(
      page,
      limit,
      search
    );

    const getThepostcount = await this.adminRepository.countAllPost(search);

    if (getAllposts) {
      return {
        posts: getAllposts.posts || [],
        total: getThepostcount || 0,
      };
    } else {
      return {
        posts: [],
        total: 0,
      };
    }
  }

  async getpostAnduserdetails(): Promise<ICounts | undefined> {
    try {
      const findTotalUsers = await this.adminRepository.getTotalUsers();
      const findTotalPosts = await this.adminRepository.getTotalPosts();
      const recentPosts = await this.adminRepository.findallpostanduser();

      if (!recentPosts || !findTotalPosts || !findTotalUsers) {
        return {
          recentPosts: [],
          totalPosts: 0,
          totalUsers: 0,
        };
      }

      return {
        recentPosts: recentPosts as any[],
        totalPosts: findTotalPosts,
        totalUsers: findTotalUsers,
      };
    } catch (error) {
      console.error("Error in getpostAnduserdetails:", error);
      throw new Error("Error fetching post and user details");
    }
  }

  async getUserdetails(
    page: number,
    limit: number,
    search: string | string[] | ParsedQs | ParsedQs[] | undefined
  ): Promise<{ userinfo: IUser[]; userscount: number } | undefined> {
    try {
      const verifyuser = await this.adminRepository.findUsers(
        page,
        limit,
        search
      );

      const getAllUserscount = await this.adminRepository.getUsersCount();
      const userinfo = verifyuser?.userinfo || [];
      const userscount = getAllUserscount?.userscount || 0;
      return {
        userinfo,
        userscount,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async updateBlocking(
    userid: string,
    isActive: boolean
  ): Promise<boolean | undefined> {
    try {
      const findUserIsBlock = await this.adminRepository.checkUserBlockStatus(
        userid,
        isActive
      );

      if (findUserIsBlock) {
        const updateuser = await this.adminRepository.ModifyUsersblock(
          userid,
          isActive
        );
        return updateuser;
      } else {
        const updateuser = await this.adminRepository.ModifyUsersblock(
          userid,
          isActive
        );
        return updateuser;
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default AdminServices;
