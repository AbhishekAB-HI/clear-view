import { IUser, Posts } from "../entities/userEntities";
import newspostSchemadata from "../model/newsModal";
import UserSchemadata from "../model/userModel";
import cloudinary from "../utils/Cloudinary";
import HashPassword from "../utils/Hashpassword";

class adminRepository {
  async findAdminbyemail(email: string | undefined) {
    const finduser = await UserSchemadata.findOne({ email });
    if (!finduser || !finduser.isAdmin) {
      throw new Error("User not found or not an admin");
    }
    return finduser;
  }

  async findReportpostPost(
    page: number,
    limit: number
  ): Promise<{ posts: Posts[]; total: number }> {
    const offset = (page - 1) * limit;

    const posts = await newspostSchemadata
      .find({ Reportpost: true })
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit);

    console.log(posts, "posts..................");

    const total = await newspostSchemadata
      .find({ Reportpost: true })
      .countDocuments();

    if (!posts || posts.length === 0) {
      throw new Error("No posts found");
    }

    return {
      posts,
      total,
    };
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


    console.log(deletPost,'post delergry');
    

    const cloudImage = deletPost.image;

    if (cloudImage) {
      await cloudinary.uploader.destroy(cloudImage);
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

    const cloudImage = deletPost.image;

    if (cloudImage) {
      await cloudinary.uploader.destroy(cloudImage);
    }
    const deletePostdata = await newspostSchemadata.findByIdAndDelete(id);
    if (deletePostdata) {
      return deletPost;
    }
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
