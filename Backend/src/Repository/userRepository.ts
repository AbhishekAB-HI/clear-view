import mongoose, { ObjectId } from "mongoose";
import { IUser, IUserReturn } from "../Entities/Userentities";
import { Posts, Postsget } from "../Entities/Postentities";
import newspostSchemadata from "../Model/Newsmodal";
import UserSchemadata from "../Model/Usermodel";
import UserTempSchemadata from "../Model/Usertempmodel";
import cloudinary from "../Utils/Cloudinary";
import HashPassword from "../Utils/Hashpassword";
import {
  generateOtp,
  sendVerifyMail,
  sendVerifyMailforemail,
} from "../Utils/Mail";

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

  async findUserInfo(userId: unknown) {
    try {

       const getUserInfo = await UserSchemadata.findById(userId)
         .populate("followers", "name email image")
         .populate("following", "name email image");

       if (!getUserInfo) {
          throw new Error("No uses founded")
       }

     
      // const getUserinfo = await UserSchemadata.findById(userId)
      return getUserInfo;
    } catch (error) {
      console.log(error);
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

  async commentthePost(
    postId: string,
    userId: mongoose.Types.ObjectId,
    comment: string
  ) {
    const post = await newspostSchemadata.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const newComment = {
      user: userId,

      content: comment,
      timestamp: new Date(),
    };
    const updatedPost = await newspostSchemadata.findByIdAndUpdate(
      postId,
      { $push: { comments: newComment } },
      { new: true }
    );

    if (!updatedPost) {
      throw new Error("Post not found");
    }

    return updatedPost;
  }

  async replythecomment(
    commentId: string,
    replymessage: string,
    postId: string,
    userId: string,
    username: string
  ) {
    const post = await newspostSchemadata.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    const newComment = {
      user: userId,
      content: replymessage,
      parentComment: commentId,
      timestamp: new Date(),
      userName: username,
    };

    const getPostdetails = await newspostSchemadata.findByIdAndUpdate(
      postId,
      { $push: { comments: newComment } },
      { new: true }
    );

    console.log(getPostdetails, "updateted here2222222222222222222222222222");

    const parnetid = getPostdetails?.comments.map((item) => item.parentComment);
    const getReplyComments = await newspostSchemadata.find({
      _id: postId,
      comments: {
        $elemMatch: { _id: parnetid },
      },
    });

    return getPostdetails;
  }

  async passProfileId(
    userId: unknown,
    page: number,
    limit: number
  ): Promise<
    | {
        userinfo: IUser | null;
        postinfo: Posts[] | null;
        totalpost: number | undefined;
      }
    | undefined
  > {
    try {
      const skip = (page - 1) * limit;
      const postinfo = await newspostSchemadata
        .find({ user: userId })
        .sort({ _id: -1 })
        .populate("comments.user")
        .populate("likes")
        .skip(skip)
        .limit(limit);

      const totalpost = await newspostSchemadata
        .find({ user: userId })
        .countDocuments();

      const userinfo = await UserSchemadata.findById(userId);
      return {
        userinfo,
        postinfo,
        totalpost,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async sendTheReportReason(
    userID: string,
    text: string,
    logeduserId: string | unknown
  ) {
    try {
      const findUser = await UserSchemadata.findById(logeduserId);
      if (findUser) {
        findUser.ReportUser.push({
          userId: new mongoose.Types.ObjectId(userID),
          reportReason: text,
        });

        await findUser.save();
      } else {
        console.log("User not found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async findAllReply(): Promise<Posts[]> {
    const matchingComments = await newspostSchemadata.aggregate([
      { $unwind: "$comments" },
      {
        $group: {
          _id: "$_id",
          allCommentsIds: { $push: "$comments._id" },
          comments: { $push: "$comments" },
        },
      },
      { $unwind: "$comments" },
      {
        $match: {
          $expr: {
            $in: ["$comments.parentComment", "$allCommentsIds"],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          matchingComments: { $push: "$comments" },
        },
      },
    ]);

    if (!matchingComments.length) {
      return [];
    }

    return matchingComments;
  }

  async LikethePost(postId: string, userId: mongoose.Types.ObjectId) {
    const post = await newspostSchemadata.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((like) => !like.equals(userId));
      post.likeCount -= 1;
      post.LikeStatement = false;
    } else {
      console.log("recahed het");

      post.likes.push(userId);

      post.likeCount += 1;
      post.LikeStatement = true;
    }
    const updatedPost = await post.save();
    return updatedPost;
  }

  async findBlockedUserinRepo(
    userId: unknown
  ): Promise<IUser[] | undefined> {
    try {
      const user = await UserSchemadata.findById(userId).populate(
        "blockedUser",
        "name email image"
      );
      if (user && user.blockedUser) {  
        console.log("Blocked users:", user.blockedUser);
        return user.blockedUser || [];
      } else {
        console.log("No blocked users found.");
        return [];
      }
    } catch (error) {
      console.log(error);
    }
  }

  async RepostPost(postid: string, text: string, userId: string) {
    try {
      const reported = await UserSchemadata.findById(userId);
      if (reported) {
        reported?.ReportPost?.push({
          postId: new mongoose.Types.ObjectId(postid),
          postreportReason: text,
          userinfo: new mongoose.Types.ObjectId(userId),
        });
      } else {
        throw new Error("Post not found");
      }
      await reported.save();
      return reported;
    } catch (error) {
      console.error("Error updating post:", error);
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

  async getAllbeeakingnews(
    page: number,
    limit: number,
    search: string
  ): Promise<{ total: number; posts: Posts[] | undefined }> {
    try {
      const skip = (page - 1) * limit;

      const posts = await newspostSchemadata.aggregate([
        {
          $match: {
            category: "Breaking news",
          },
        },
        {
          $lookup: {
            from: "userdetails",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: {
            $or: [
              { description: { $regex: search, $options: "i" } },
              { "user.name": { $regex: search, $options: "i" } },
            ],
          },
        },
        { $sort: { _id: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);

      // Check if no posts found
      if (posts.length === 0) {
        return {
          total: 0,
          posts: [],
        };
      }

      const totalResults = await newspostSchemadata.aggregate([
        {
          $match: {
            category: "Breaking news",
          },
        },
        {
          $lookup: {
            from: "userdetails",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: {
            $or: [
              { description: { $regex: search, $options: "i" } },
              { "user.name": { $regex: search, $options: "i" } },
            ],
          },
        },
        { $count: "total" },
      ]);

      const total = totalResults[0]?.total || 0;

      return {
        total,
        posts,
      };
    } catch (error) {
      console.error("Error fetching paginated data:", error);
      throw error;
    }
  }

  async getAllthedata(search: string,category: string): Promise<{ posts: Posts[] | undefined }> {
    try {
      if (category === "Allpost") {
        const posts = await newspostSchemadata.aggregate([
          { $match: { BlockPost: false } },
          {
            $lookup: {
              from: "userdetails",
              localField: "user",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },

          {
            $match: {
              $or: [
                { description: { $regex: search, $options: "i" } },
                { "user.name": { $regex: search, $options: "i" } },
              ],
            },
          },

          { $sort: { _id: -1 } },

        

          {
            $lookup: {
              from: "userdetails",
              localField: "comments.user",
              foreignField: "_id",
              as: "commentUsers",
            },
          },

          {
            $addFields: {
              comments: {
                $map: {
                  input: "$comments",
                  as: "comment",
                  in: {
                    $mergeObjects: [
                      "$$comment",
                      {
                        user: {
                          $arrayElemAt: [
                            "$commentUsers",
                            {
                              $indexOfArray: [
                                "$comments.user",
                                "$$comment.user",
                              ],
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            },
          },

          { $unset: "commentUsers" },

          {
            $lookup: {
              from: "userdetails",
              localField: "likes",
              foreignField: "_id",
              as: "likes",
            },
          },
        ]);

        if (posts.length === 0) {
          return { posts: [] };
        }
        return {
          posts,
        };
      }else if (category === "Latest news"){
        const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
         const latestposts = await newspostSchemadata.aggregate([
           { $match: { BlockPost: false, createdAt: { $gte: fiveHoursAgo } } },
           {
             $lookup: {
               from: "userdetails",
               localField: "user",
               foreignField: "_id",
               as: "user",
             },
           },
           { $unwind: "$user" },

           {
             $match: {
               $or: [
                 { description: { $regex: search, $options: "i" } },
                 { "user.name": { $regex: search, $options: "i" } },
               ],
             },
           },

           { $sort: { _id: -1 } },

           {
             $lookup: {
               from: "userdetails",
               localField: "comments.user",
               foreignField: "_id",
               as: "commentUsers",
             },
           },

           {
             $addFields: {
               comments: {
                 $map: {
                   input: "$comments",
                   as: "comment",
                   in: {
                     $mergeObjects: [
                       "$$comment",
                       {
                         user: {
                           $arrayElemAt: [
                             "$commentUsers",
                             {
                               $indexOfArray: [
                                 "$comments.user",
                                 "$$comment.user",
                               ],
                             },
                           ],
                         },
                       },
                     ],
                   },
                 },
               },
             },
           },

           { $unset: "commentUsers" },

           {
             $lookup: {
               from: "userdetails",
               localField: "likes",
               foreignField: "_id",
               as: "likes",
             },
           },
         ]);

         if (latestposts.length === 0) {
           return { posts: [] };
         }
      
        return { posts: latestposts };
      }
        const posts = await newspostSchemadata.aggregate([
          { $match: { $and: [{ BlockPost: false }, { category: category }] } },
          {
            $lookup: {
              from: "userdetails",
              localField: "user",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $match: {
              $or: [
                { description: { $regex: search, $options: "i" } },
                { "user.name": { $regex: search, $options: "i" } },
              ],
            },
          },
          { $sort: { _id: -1 } },

          {
            $lookup: {
              from: "userdetails",
              localField: "comments.user",
              foreignField: "_id",
              as: "commentUsers",
            },
          },
          {
            $addFields: {
              comments: {
                $map: {
                  input: "$comments",
                  as: "comment",
                  in: {
                    $mergeObjects: [
                      "$$comment",
                      {
                        user: {
                          $arrayElemAt: [
                            "$commentUsers",
                            {
                              $indexOfArray: [
                                "$comments.user",
                                "$$comment.user",
                              ],
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            },
          },

          { $unset: "commentUsers" },
          {
            $lookup: {
              from: "userdetails",
              localField: "likes",
              foreignField: "_id",
              as: "likes",
            },
          },
        ]);
      if (posts.length === 0) {
        return {
          posts: [],
        };
      }
      return {
        posts,
      };
    } catch (error) {
      console.error("Error fetching paginated data:", error);
      throw error;
    }
  }

  async getAlltheUsers(
    searchId: unknown,
    userId: unknown
  ): Promise<IUser[] | undefined> {
    try {
      const getSearch = searchId
        ? {
            $or: [{ name: { $regex: searchId, $options: "i" } }],
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

  async postidreceived(postId: string) {
    try {
      const deletePost = await newspostSchemadata.findById(postId);
      if (!deletePost) {
        throw new Error("No post found");
      }

      const { image, videos } = deletePost;
      if (image && image.length > 0) {
        for (const img of image) {
          const publicId = img.split("/").slice(-1)[0].split(".")[0];
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });
          console.log("Image deleted from Cloudinary");
        }
      }

      if (videos && videos.length > 0) {
        for (const video of videos) {
          const publicId = video.split("/").slice(-1)[0].split(".")[0];
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
          });
          console.log("Video deleted from Cloudinary");
        }
      }

      const deletePostdata = await newspostSchemadata.findByIdAndDelete(postId);
      console.log(deletePostdata, "Post deleted from database");
    } catch (error) {
      console.log("Error:", error);
      throw error;
    }
  }

  async getPostUserData(
    userId: unknown,
    page: number,
    limit: number
  ): Promise<{ posts: Posts[]; total: number } | undefined> {
    try {
      const skip = (page - 1) * limit;

      const userDetail = await UserSchemadata.findById(userId);
      if (!userDetail) {
        throw new Error("No user found");
      }

      const posts = await newspostSchemadata
        .find({ user: userId })
        .sort({ _id: -1 })
        .populate("comments.user")
        .populate("likes")
        .skip(skip)
        .limit(limit);

      const total = await newspostSchemadata.countDocuments({ user: userId });

      if (!posts || posts.length === 0) {
        throw new Error("No posts found for the user");
      }

      return { posts, total };
    } catch (error) {
      console.error("Error fetching user posts:", error);
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
    Category: string,
    imageFiles: string[],
    videoFiles: string[]
  ): Promise<Posts | undefined> {
    try {
      // Step 1: Verify the user
      const user = await UserSchemadata.findById(userId);
      if (!user) {
        throw new Error("user not found");
      }

      // Step 2: Create and save the new post
      const newPost = new newspostSchemadata({
        user: user._id,
        description: content,
        category: Category,
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

  async findUserData(userId: string) {
    try {
      const finduserid = await UserSchemadata.findById(userId);

      if (finduserid) {
        return finduserid;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updateUserpassword(
    userId: string,
    newpassword: string
  ): Promise<IUser | undefined> {
    try {
      const options = {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      };

      const userdata = await UserSchemadata.findByIdAndUpdate(userId, {
        password: newpassword,
        options,
      });
      if (!userdata) {
        throw new Error("No user found");
      }
      return userdata;
    } catch (error) {
      console.error("Repository error:", error);
      throw new Error("Database error: Could not update user profile");
    }
  }

  async updateUserProfile(
    name: string,
    image: string,
    userid: string
  ): Promise<IUser | undefined> {
    try {
      const options = {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      };

      const userdata = await UserSchemadata.findByIdAndUpdate(userid, {
        name: name,
        image: image,
        options,
      });
      if (!userdata) {
        throw new Error("No user found");
      }
      return userdata;
    } catch (error) {
      console.error("Repository error:", error);
      throw new Error("Database error: Could not update user profile");
    }
  }
}

export default userRepository;
