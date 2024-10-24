import { IUser } from "../Entities/Userentities";
import { Posts } from "../Entities/Postentities";
import newspostSchemadata from "../Model/Newsmodal";
import UserSchemadata from "../Model/Usermodel";
import cloudinary from "../Utils/Cloudinary";
import HashPassword from "../Utils/Hashpassword";

class adminRepository {
  async findAdminbyemail(email: string | undefined) {
    const finduser = await UserSchemadata.findOne({ email });
    if (!finduser || !finduser.isAdmin) {
      throw new Error("User not found or not an admin");
    }
    return finduser;
  }

  async findAllReportUsers(): Promise<[] | any> {
    try {
      const usersWithReports = await UserSchemadata.find({
        ReportUser: { $exists: true, $not: { $size: 0 } },
      }).populate({ path: "ReportUser.userId" }).exec();

      const reports = usersWithReports.flatMap((user) =>
        user.ReportUser.map((report) => ({
          reporter: { _id: user._id, name: user.name, email: user.email },
          reportedUser: report.userId,
          reportReason: report.reportReason,
        }))
      );
      return reports; 
    } catch (error) {
      console.log(error);
    }
  }

 async  findReportPost(page: number, limit: number) {
  try {

    const offset = (page - 1) * limit;
    const reportedPosts = await UserSchemadata.find({
      ReportPost: { $exists: true, $not: { $size: 0 } },
    }).populate({ path: "ReportPost.postId" }).skip(offset).limit(limit).exec();


     const postReports = reportedPosts.flatMap((user) =>
      user.ReportPost?.map((report) => {
        if (!report.postId) return null; // Skip if postId is null
        return {
          reporter: { _id: user._id, name: user.name },
          postId: report.postId,
          reportReason: report.postreportReason,
        };
      })
    ).filter(report => report !== null); 

    

    // const postReports = reportedPosts.flatMap((user) =>
    //   user.ReportPost?.map((report) => ({
    //     reporter: { _id: user._id, name: user.name },
    //     postId: report.postId,
    //     reportReason: report.postreportReason,
    //   }))
    // );
   
    const totalReports = await UserSchemadata.countDocuments({
      ReportPost: { $exists: true, $not: { $size: 0 } },
    });
 
    return {
      posts: postReports, 
      total: totalReports, 
    };
  } catch (error) {
    console.error("Error fetching reported posts:", error);
    throw error;
  }
}


  async findPost(
    page: number,
    limit: number
  ): Promise<{ posts: Posts[]; total: number }> {
    const offset = (page - 1) * limit;

    const posts = await newspostSchemadata
      .find()
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit);

    const total = await newspostSchemadata.countDocuments();

    if (!posts || posts.length === 0) {
      throw new Error("No posts found");
    }

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

    // console.log(deletPost, "post delergry");

    // const { image, videos } = deletPost;
    // if (image && image.length > 0) {
    //   for (const img of image) {
    //     await cloudinary.uploader.destroy(image);
    //     console.log("Image deleted from Cloudinary");
    //   }
    // }

    // if (videos && videos.length > 0) {
    //   for (const video of videos) {
    //     await cloudinary.uploader.destroy(video);
    //     console.log("video deleted from Cloudinary");
    //   }
    // }
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

    // const deletePostdata = await newspostSchemadata.findByIdAndDelete(id);
    // if (deletePostdata) {
    //   return deletPost;
    // }
  }

  async findUsers(): Promise<IUser[]> {
    const userDatas = await UserSchemadata.find();
    if (!userDatas) {
      throw new Error("No users found");
    }
    return userDatas;
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

      //  return userdata;
    } else {
      const userdata = await UserSchemadata.findByIdAndUpdate(userid, {
        isActive: false,
      });

      console.log(userdata, "iiiiiiiiiiiiiiiiiii");
      // return userdata;
      return userdata?.isActive;
    }
  }
}

export default adminRepository;
