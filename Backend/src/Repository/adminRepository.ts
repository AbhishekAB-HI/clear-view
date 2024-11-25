import { IUser } from "../Entities/Userentities";
import { Posts } from "../Entities/Postentities";
import newspostSchemadata from "../Model/Newsmodal";
import UserSchemadata from "../Model/Usermodel";
import cloudinary from "../Config/Cloudinaryconfig";
import { ICounts } from "../Interface/userInterface/Userdetail";
import { ParsedQs } from "qs";
class adminRepository {
  async findAdminbyemail(email: string | undefined) {
    const finduser = await UserSchemadata.findOne({ email });
    if (!finduser || !finduser.isAdmin) {
      throw new Error("User not found or not an admin");
    }
    return finduser;
  }

  // async findAllReportUsers(): Promise<[] | any> {
  //   try {
  //     const usersWithReports = await UserSchemadata.find({
  //       ReportUser: { $exists: true, $not: { $size: 0 } },
  //     })
  //       .populate({ path: "ReportUser.userId" })
  //       .exec();

  //     const reports = usersWithReports.flatMap((user) =>
  //       user.ReportUser.map((report) => ({
  //         reporter: { _id: user._id, name: user.name, email: user.email },
  //         reportedUser: report.userId,
  //         reportReason: report.reportReason,
  //       }))
  //     );
  //     return reports;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  async findAllReportUsers(
    page: number,
    limit: number,
    search: string | unknown
  ): Promise<{ Reports: any[]; totalcount: number } | undefined> {
    try {
      const offset = (page - 1) * limit;

      const usersWithReports = await UserSchemadata.find(
        {
          ReportUser: { $exists: true, $not: { $size: 0 } },
        },
        { ReportUser: 1 }
      )
        .skip(offset)
        .limit(limit)
        .populate({ path: "ReportUser.userId" })
        .exec();

      const countReportUsers = await UserSchemadata.find(
        {
          ReportUser: { $exists: true, $not: { $size: 0 } },
        },
        { ReportUser: 1 }
      ).countDocuments();

      const reports = usersWithReports.flatMap((user) =>
        user.ReportUser.map((report) => ({
          reporter: { _id: user._id, name: user.name, email: user.email },
          reportedUser: report.userId,
          reportReason: report.reportReason,
        }))
      );
      return {
        Reports: reports,
        totalcount: countReportUsers,
      };
    } catch (error) {
      console.log(error);
    }
  }
  async  findReportPost(page:number, limit:number) {
  try {
    const offset = (page - 1) * limit;

    // Fetch the users with reported posts
    const reportedPosts = await UserSchemadata.find(
      {
        ReportPost: { $exists: true, $not: { $size: 0 } },
      },
      { _id: 1, name: 1, ReportPost: 1 } // Fetch only necessary fields
    )
      .skip(offset)
      .limit(limit)
      .exec();

    // Transform the data
    const postReports = reportedPosts
      .flatMap((user) =>
        user.ReportPost?.map((report) => ({
          reporter: { _id: user._id, name: user.name },
          postId: report.postId,
          postcontent: report.postcontent,
          postimage: report.postimage,
          postreportReason: report.postreportReason,
          postedBy: report.postedBy,
          reportedBy: report.reportedBy,
        }))
      )
      .filter(Boolean); // Remove null/undefined values

    // Count the total number of reports
    const totalReports = await UserSchemadata.countDocuments({
      ReportPost: { $exists: true, $not: { $size: 0 } },
    });

    return {
      posts: postReports,
      total: totalReports,
    };
  } catch (error) {
    console.error("Error fetching reported posts:", error, { page, limit });
    throw new Error("Failed to fetch reported posts");
  }
}


  // async findReportPost(page: number, limit: number) {
  //   try {
  //     const offset = (page - 1) * limit;

  //     const reportedPosts = await newspostSchemadata
  //       .find({
  //         _id: { $in: await UserSchemadata.distinct("ReportPost.postId") },
  //       })
  //       .populate({
  //         path: "_id",
  //         model: "post",
  //       })
  //       .skip(offset)
  //       .limit(limit)
  //       .exec();

  //     // Get reports for the fetched posts
  //     const postReports = await Promise.all(
  //       reportedPosts.map(async (post) => {
  //         // Find users who reported this post
  //         const reportingUsers = await UserSchemadata.find({
  //           "ReportPost.postId": post._id,
  //         }).select("name ReportPost");

  //         return reportingUsers.map((user) => {
  //           return {
  //             reporter: { _id: user._id, name: user.name },
  //             postId: post._id,
  //           };
  //         });
  //       })
  //     );

  //     const flattenedReports = postReports.flat();

  //     // Get the total count of unique reported posts
  //     const totalReports = await newspostSchemadata.countDocuments({
  //       _id: { $in: await UserSchemadata.distinct("ReportPost.postId") },
  //     });

  //     return {
  //       posts: flattenedReports,
  //       total: totalReports,
  //     };
  //   } catch (error) {
  //     console.error("Error fetching reported posts:", error);
  //     throw error;
  //   }
  // }

  async findPost(
    page: number,
    limit: number,
    search: string | unknown
  ): Promise<{ posts: Posts[]; total: number }> {
    const offset = (page - 1) * limit;
    const query = search
      ? {
          $or: [
            { description: { $regex: search, $options: "i" } }, // Search in description
            { "user.name": { $regex: search, $options: "i" } }, // Search in user name
          ],
        }
      : {};

    const posts = await newspostSchemadata
      .find(query)
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit)
      .populate("user", "name email");

    const total = await newspostSchemadata.countDocuments(query);

    return {
      posts,
      total,
    };
  }
  async deleteReportedPost(id: string) {
    const deletPost = await newspostSchemadata.findById(id);
    if (!deletPost) {
      throw new Error("Post is not found");
    }

    const { image, videos } = deletPost;
    if (image && image.length > 0) {
      for (const img of image) {
        await cloudinary.uploader.destroy(image);
        console.log("Image deleted from Cloudinary");
      }
    }

    if (videos && videos.length > 0) {
      for (const video of videos) {
        await cloudinary.uploader.destroy(video);
        console.log("video deleted from Cloudinary");
      }
    }

    const deletePostdata = await newspostSchemadata.findByIdAndDelete(id);
    if (deletePostdata) {
      return deletPost;
    }
  }

  async deletePost(id: string) {
    const deletPost = await newspostSchemadata.findById(id);
    if (!deletPost) {
      throw new Error("Post is not found");
    }

    if (!deletPost.BlockPost) {
      const isBlocked = await newspostSchemadata.findByIdAndUpdate(id, {
        BlockPost: true,
      });
    } else {
      const isBlocked = await newspostSchemadata.findByIdAndUpdate(id, {
        BlockPost: false,
      });
    }

    return deletPost.BlockPost;
  }

  async findallpostanduser(): Promise<ICounts> {
    try {
      const totalUsers = await UserSchemadata.countDocuments();
      if (totalUsers === 0) {
        throw new Error("No users found");
      }

      const totalPosts = await newspostSchemadata.countDocuments();
      if (totalPosts === 0) {
        throw new Error("No posts found");
      }

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
        totalUsers,
        totalPosts,
        recentPosts,
      };
    } catch (error) {
      console.error("Error fetching users and posts:", error);
      throw new Error("Error fetching data");
    }
  }

  async findUsers(
    page: number,
    limit: number,
    search: string | string[] | ParsedQs | ParsedQs[] | undefined
  ): Promise<{ userinfo: IUser[]; userscount: number }> {
    const skip = (page - 1) * limit;

    const searchterm = search;
    const query = searchterm
      ? {
          $or: [
            { name: { $regex: searchterm, $options: "i" } }, // Case-insensitive match on 'name'
            { email: { $regex: searchterm, $options: "i" } }, // Case-insensitive match on 'email'
          ],
        }
      : {};

    const userDatas = await UserSchemadata.find(query).skip(skip).limit(limit);
    const Alluserscount = await UserSchemadata.countDocuments();
    if (!userDatas) {
      return {
        userinfo: [],
        userscount: 0,
      };
    }
    return {
      userinfo: userDatas,
      userscount: Alluserscount,
    };
  }

  async ModifyUsersblock(
    userid: string,
    isActive: boolean
  ): Promise<boolean | undefined> {
    if (!isActive) {
      const userdata = await UserSchemadata.findByIdAndUpdate(userid, {
        isActive: true,
      });

      return userdata?.isActive;
    } else {
      const userdata = await UserSchemadata.findByIdAndUpdate(userid, {
        isActive: false,
      });

      return userdata?.isActive;
    }
  }
}

export default adminRepository;
