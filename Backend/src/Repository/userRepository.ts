import { IUser, IUserReturn, Posts, Postsget } from "../entities/userEntities";
import newspostSchemadata from "../model/newsModal";
import UserSchemadata from "../model/userModel";
import UserTempSchemadata from "../model/userTempModel";
import cloudinary from "../utils/Cloudinary";
import HashPassword from "../utils/Hashpassword";
import {
  generateOtp,
  sendVerifyMail,
  sendVerifyMailforemail,
} from "../utils/mail";

class userRepository {
  async userRegister(
    userData: Partial<IUser>
  ): Promise<IUserReturn | undefined> {
    try {
      console.log("register.............");
      if (!userData.password) {
        throw new Error("Password is Required");
      }

      if (!userData.email) {
        throw new Error("Email is Required");
      }
      const hashedPassword = await HashPassword.hashPassword(userData.password);

      console.log("wdn ufhcnef");

      const otp = generateOtp();

      let userName = userData.name || "";
      await sendVerifyMail(userData.email, userName, otp);
      const updateData = {
        ...userData,
        password: hashedPassword,
        otp: otp,
        isActive: userData.isActive ?? false,
      };

      const options = {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      };

      const updateUser = await UserTempSchemadata.findOneAndUpdate(
        { email: userData.email },
        updateData,
        options
      );
      return updateUser ?? undefined;
    } catch (error) {
      console.error(`Error in mentorRegister: ${error}`);
    }
  }

  async verifyresend(email: string) {
    try {
      const mailotp = generateOtp();
      await sendVerifyMailforemail(email, mailotp);

      let update = await UserTempSchemadata.findOneAndUpdate(
        { email: email },
        {
          otp: mailotp,
        }
      );
      if (!update) {
        throw new Error("No user found");
      }

      return update;
    } catch (error) {
      console.log(error);
    }
  }

  async findotp(otp: number, email: string): Promise<IUser | undefined> {
    try {
      let otpget = otp;
      let userDetail = await UserTempSchemadata.findOne({ email }).exec();
      console.log(userDetail, "user details get here");
      if (!userDetail) {
        throw new Error("User not found ");
      }
      if (userDetail.otp !== otpget) {
        throw new Error("OTP is not matching");
      }

      const userSchema = new UserSchemadata({
        name: userDetail.name,
        email: userDetail.email,
        password: userDetail.password,
        isActive: false,
        isAdmin: false,
      });

      const userdetailsget = await userSchema.save();
      await UserTempSchemadata.deleteOne({ email });
      return userdetailsget;
    } catch (error) {
      console.log(error);
    }
  }

  async findByEmail(email: string) {
    let userDetail = UserSchemadata.findOne({ email }).exec();
    return userDetail;
  }

  async checkByEmail(userdata: any) {
    try {
      let email = userdata.email;
      let userDetail = await UserSchemadata.findOne({ email }).exec();
      if (!userDetail) {
        throw new Error("No user found");
      }
      return userDetail;
    } catch (error) {
      console.log(error);
    }
  }

  async checkByisActive(email: string) {
    try {
      let userData = await UserSchemadata.findOne({ email });
      if (!userData?.isActive) {
        throw new Error("This user is blocked");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async checkingforgetotp(otp: number, email: string) {
    let getuser = await UserTempSchemadata.findOne({ email });
    if (!getuser) {
      throw new Error("User not found ");
    }
    if (getuser.otp != otp) {
      throw new Error("Wrong otp entered");
    }

    return getuser;
  }

  async RepostPost(postid: string) {
    try {
      const reported = await newspostSchemadata.findByIdAndUpdate(
        postid,
        { $set: { Reportpost: true } },
        { new: true, upsert: false }
      );

      if (!reported) {
        throw new Error("Post not found");
      }

      return reported;
    } catch (error) {
      console.error("Error updating post:", error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  async changingpassword(email: string, password: string) {
    const hashedPassword = await HashPassword.hashPassword(password);

    const Changepassword = await UserSchemadata.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
      }
    );

    return Changepassword;
  }

  async FindEmail(email: string | undefined) {
    try {
      let getUser = await UserSchemadata.findOne({ email: email });
      return getUser;
    } catch (error) {
      console.log("error");
    }
  }

  async checkingmail(email: string | undefined) {
    try {
      const otp = generateOtp();
      console.log(otp, "otp");
      console.log(email, "email............");
      await sendVerifyMailforemail(email, otp);
      const options = {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      };

      const updateUser = await UserTempSchemadata.findOneAndUpdate(
        { email: email },
        { otp: otp },
        options
      );
      let userDetail = await UserSchemadata.findOne({ email }).exec();
      return userDetail;
    } catch (error) {
      console.log(error);
    }
  }

  async getUserProfile(userId: unknown) {
    try {
      let userDetail = await UserSchemadata.findById(userId);
      if (userDetail) {
        return userDetail;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getTheUser(userId: unknown): Promise<IUser | undefined> {
    try {
      let userDetail = await UserSchemadata.findById(userId);
      if (userDetail) {
        return userDetail;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getAllthedata(): Promise<Posts[] | undefined> {
    const getAllpost = await newspostSchemadata
      .find()
      .populate("user")
      .sort({ _id: -1 });

    console.log(getAllpost, "get all post with user details");
    return getAllpost;
  }

  async getAlltheUsers(searchId: unknown, userId: unknown): Promise<IUser[] | undefined> {
    try {
      const getSearch = searchId
        ? {
            $or: [
              { name: { $regex: searchId, $options: "i" } },
            ],
          }
        : {};

      const users = await UserSchemadata.find(getSearch)
        .find({
          _id: { $ne: userId },
        })
        .select("-password");

      if (!users) {
        throw new Error("No users found");
      }
      return users;
    } catch (error) {
      console.log(error);
    }
  }

  async postidreceived(postId: string): Promise<any> {
    try {
      const deletePost = await newspostSchemadata.findById(postId);
      console.log(deletePost, "Post found");

      if (!deletePost) {
        throw new Error("No post found");
      }

      const { image, videos } = deletePost;

      // const extractPublicId = (url: string): string | null => {
      //   const regex = /\/v\d+\/([^\.]+)/;
      //   const match = url.match(regex);
      //   return match ? match[1] : null;
      // };

      // const imagePublicId = image ? extractPublicId(image) : null;
      // const videoPublicId = videos ? extractPublicId(videos) : null;

      if (image) {
        await cloudinary.uploader.destroy(image);
        console.log("Image deleted from Cloudinary");
      }

      // if (videoPublicId) {
      //   await cloudinary.uploader.destroy(videoPublicId);
      //   console.log('Video deleted from Cloudinary');
      // }

      const deletePostdata = await newspostSchemadata.findByIdAndDelete(postId);
      console.log(deletePostdata, "Post deleted from database");

      if (deletePostdata) {
        return deletePostdata;
      } else {
        throw new Error("Failed to delete post");
      }
    } catch (error) {
      console.log("Error:", error);
      throw error;
    }
  }

  async getpostUserdata(userId: unknown): Promise<Posts[] | undefined> {
    try {
      let userDetail = await UserSchemadata.findById(userId);
      if (!userDetail) {
        throw new Error("No user found");
      }
      let getverifyuser = await newspostSchemadata
        .find({ user: userId })
        .sort({ _id: -1 });
      if (!getverifyuser || getverifyuser.length === 0) {
        throw new Error("No posts found for the user");
      }
      console.log(getverifyuser, "Fetched user posts");
      return getverifyuser;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async findeditpostdetails(
    postId: string,
    content: string,
    imageFiles: string[],
    videoFiles: string[]
  ): Promise<Posts | undefined> {
    try {
      // Step 1: Verify the user

      console.log(
        {
          postId,
          content,
          imageFiles,
          videoFiles,
        },
        "Data to be saved"
      );

      // Step 2: Create and save the new post

      const savedPost = await newspostSchemadata.findByIdAndUpdate(
        postId,
        {
          description: content,
          image: imageFiles,
          videos: videoFiles,
        },
        {
          new: true,
        }
      );

      if (savedPost) {
        return savedPost;
      }
    } catch (error) {
      console.error("Error while creating post:", error);
    }
  }

  async findUserdetails(
    userId: string,
    content: string,
    imageFiles: string[],
    videoFiles: string[]
  ): Promise<Posts | undefined> {
    try {
      // Step 1: Verify the user
      const user = await UserSchemadata.findById(userId);
      if (!user) {
        throw new Error("user not found");
      }
      console.log(videoFiles, "Videoooooooooooooooooooooooooooooooooooos");
      console.log(
        {
          userId,
          content,
          imageFiles,
          videoFiles,
        },
        "Data to be saved"
      );

      // Step 2: Create and save the new post
      const newPost = new newspostSchemadata({
        user: user._id,
        description: content,
        image: imageFiles.length ? imageFiles : [],
        videos: videoFiles.length ? videoFiles : [],
      });

      const savedPost = await newPost.save();
      if (savedPost) {
        return savedPost;
      }
    } catch (error) {
      console.error("Error while creating post:", error);
    }
  }

  async checkPassword(userId: string) {
    try {
      let userDetail = await UserSchemadata.findById(userId);
      if (userDetail) {
        return userDetail;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updateUserProfile(
    name: string,
    password: string,
    newpassword: string,
    image: string,
    userid: string
  ): Promise<IUser | undefined> {
    try {
      const hashedPassword = await HashPassword.hashPassword(newpassword);
      const options = {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      };

      const userdata = await UserSchemadata.findByIdAndUpdate(userid, {
        name: name,
        password: hashedPassword,
        image: image,
        options,
      });
      if (!userdata) {
        throw new Error("No user found");
      }
      return userdata;
    } catch (error) {
      console.log(error);
    }
  }
}

export default userRepository;
