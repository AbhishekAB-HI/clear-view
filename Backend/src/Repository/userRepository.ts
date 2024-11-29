import mongoose, { ObjectId } from "mongoose";
import { IUser, IUserReturn } from "../entities/userEntities";
import { Posts, Postsget } from "../entities/Postentities";
import newspostSchemadata from "../model/newsModal";
import UserSchemadata from "../model/userModel";
import UserTempSchemadata from "../model/Usertempmodel";
import cloudinary from "../config/Cloudinaryconfig";
import HashPassword from "../Utils/Hashpassword";
import {
  generateOtp,
  sendVerifyMail,
  sendVerifyMailforemail,
} from "../Utils/Mail";
import GetAllNotificationsSchema from "../model/AllnotificationSchema";
import { IAllNotification } from "../entities/Notificationentitities";
import { IUserRepository } from "../Interface/Users/UserRepository";
class userRepository implements IUserRepository {
  async userRegister(
    userData: Partial<IUser>
  ): Promise<IUserReturn | undefined> {
    try {
      if (!userData.password) {
        throw new Error("Password is Required");
      }

      if (!userData.email) {
        throw new Error("Email is Required");
      }
      const hashedPassword = await HashPassword.hashPassword(userData.password);
      const otp = generateOtp();
      await sendVerifyMail(userData.email, userData.name, otp);
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

  async findlastseenupdate(userId: unknown): Promise<IUser | unknown> {
    try {
      const getUserInfo = await UserSchemadata.findByIdAndUpdate(
        userId,
        { $set: { lastSeen: new Date() } },
        { new: true, upsert: true }
      );
      return getUserInfo;
    } catch (error) {
      console.log(error);
    }
  }

  async findUserInfo(userId: unknown): Promise<IUser | undefined> {
    try {
      const getUserInfo = await UserSchemadata.findById(userId)
        .populate("followers", "name email image")
        .populate("following", "name email image");

      console.log(getUserInfo, "user detailsssssssssssssssssssssssssssssssss");

      if (!getUserInfo) {
        throw new Error("No uses founded");
      }
      return getUserInfo;
    } catch (error) {
      console.log(error);
    }
  }

  async verifyresend(email: string): Promise<IUserReturn | undefined> {
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
        lastSeen: new Date(),
      });

      const userdetailsget = await userSchema.save();
      await UserTempSchemadata.deleteOne({ email });
      return userdetailsget;
    } catch (error) {
      console.log(error);
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    let userDetail = UserSchemadata.findOne({ email }).exec();
    return userDetail;
  }

  async checkByEmail(userdata: any): Promise<IUser | undefined> {
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
  async updateTime(email: string): Promise<void> {
    try {
      let userData = await UserSchemadata.findOneAndUpdate(
        { email },
        { $set: { lastSeen: new Date() } },
        { new: true, upsert: true }
      );
    } catch (error) {
      console.log(error);
    }
  }

  async checkByisActive(email: string): Promise<void> {
    try {
      let userData = await UserSchemadata.findOne({ email });
      if (!userData?.isActive) {
        throw new Error("This user is blocked");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async checkingforgetotp(
    otp: number,
    email: string
  ): Promise<IUser | undefined> {
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
  ): Promise<Posts | null> {
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
  ): Promise<Posts | null> {
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
      const userinfo = await UserSchemadata.findById(userId)
        .populate("following")
        .populate("followers");
      return {
        userinfo,
        postinfo,
        totalpost,
      };
    } catch (error) {
      console.log(error);
    }
  }

  // async RepostPost(
  //   postid: string,
  //   text: string,
  //   userId: string
  // ): Promise<IUser | undefined> {
  //   try {
  //     const reported = await UserSchemadata.findById(userId);
  //     const postdetails = await newspostSchemadata
  //       .findById(postid)
  //       .populate("user");

  //     const postImage =
  //       Array.isArray(postdetails?.image) && postdetails?.image[0]
  //         ? String(postdetails?.image[0])
  //         : "";
  //     const postVideo =
  //       Array.isArray(postdetails?.videos) && postdetails?.videos[0]
  //         ? String(postdetails?.videos[0])
  //         : "";

  //     if (reported) {
  //       reported?.ReportPost?.push({
  //         postId: new mongoose.Types.ObjectId(postid),
  //         postreportReason: text,
  //         userinfo: new mongoose.Types.ObjectId(userId),
  //         postcontent: postdetails?.description,
  //         postimage: postImage,
  //         postVideo: postVideo,
  //         postedBy: postdetails?.user.name,
  //         reportedBy: reported.name,
  //       });
  //     } else {
  //       throw new Error("issue with posting post report");
  //     }
  //     await reported.save();
  //     return reported;
  //   } catch (error) {
  //     console.error("Error updating post:", error);
  //   }
  // }
  async sendTheReportReason(
    userID: string,
    text: string,
    logeduserId: string
  ): Promise<void> {
    try {
      console.log(userID, "111111111111111111111111111111111111");
      const findReporteduser = await UserSchemadata.findById(userID);
      console.log(
        findReporteduser,
        "222222222222222222222222222222222222222222222222222222222"
      );
      const findUser = await UserSchemadata.findById(logeduserId);
      if (findUser) {
        findUser?.ReportUser?.push({
          userId: userID,
          reportReason: text,
          Reportedby: findUser?.name,
          username: findReporteduser?.name,
          userimage: findReporteduser?.image,
        });

        await findUser.save();
        console.log("Report reason successfully saved.");
      } else {
        console.log("User not found");
      }
    } catch (error) {
      console.error("Error saving the report reason:", error);
    }
  }

  // async sendTheReportReason(
  //   userID: string,
  //   text: string,
  //   logeduserId: string | unknown
  // ): Promise<void> {
  //   try {
  //     const findUser = await UserSchemadata.findById(logeduserId);
  //     if (findUser) {
  //       findUser?.ReportUser?.push({
  //         userId: new mongoose.Types.ObjectId(userID),
  //         userreportReason: text,

  //       });

  //       await findUser.save();
  //     } else {
  //       console.log("User not found");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

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

  async LikethePost(
    postId: string,
    userId: mongoose.Types.ObjectId
  ): Promise<IAllNotification | unknown> {
    const post = await newspostSchemadata.findById(postId).populate("user");
    if (!post) {
      throw new Error("Post not found");
    }

    const finduserinfo = await UserSchemadata.findById(userId);
    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((like) => !like.equals(userId));
      post.likeCount -= 1;
      post.LikeStatement = false;
    } else {
      post.likes.push(userId);
      post.likeCount += 1;
      post.LikeStatement = true;
    }
    const updatedPost = await post.save();
    if (alreadyLiked) {
      return [];
    }
    const findLikednotify = await GetAllNotificationsSchema.findOne({
      "LikeNotifications.postId": postId,
    });

    if (findLikednotify) {
      return findLikednotify;
    }

    if (findLikednotify && !post.LikeStatement) {
      return [];
    }

    const likenotifications = {
      postId: postId,
      postuserId: post?.user._id,
      likedusername: finduserinfo?.name,
      userimage: post?.user.image,
      postimage: post?.image[0],
      postcontent: post?.description,
      likeduserId: userId,
      likedstatus: post.likes,
    };
    const postDetails = new GetAllNotificationsSchema({
      LikeNotifications: [likenotifications],
    });
    const savethepost = await postDetails.save();

    const sameuser = postDetails.LikeNotifications.filter((postdetail: any) => {
      return (
        postdetail.postuserId[0].toString() ===
        postdetail.likeduserId.toString()
      );
    });

    if (sameuser) {
      return [];
    }

    return savethepost;
  }

  async findBlockedUserinRepo(
    userId: unknown,
    page: number,
    limit: number
  ): Promise<{ Allusers: IUser[]; totalblockuser: number } | undefined> {
    try {
      const skip = (page - 1) * limit;
      const user = await UserSchemadata.findById(userId, { blockedUser: 1 })
        .populate("blockedUser", "name email image")
        .skip(skip)
        .limit(limit);

      console.log(user, "2222222222222222222222");

      const totalusers = await UserSchemadata.findById(userId, {
        blockedUser: 1,
      }).countDocuments();

      if (user && user.blockedUser) {
        console.log("Blocked users:", user.blockedUser);
        return { Allusers: user.blockedUser || [], totalblockuser: totalusers };
      } else {
        console.log("No blocked users found.");
        return { Allusers: [], totalblockuser: 0 };
      }
    } catch (error) {
      console.log(error);
    }
  }

  async RepostPost(
    postid: string,
    text: string,
    userId: string
  ): Promise<IUser | undefined> {
    try {
      const reported = await UserSchemadata.findById(userId);
      const postdetails = await newspostSchemadata
        .findById(postid)
        .populate("user");

      const postImage =
        Array.isArray(postdetails?.image) && postdetails?.image[0]
          ? String(postdetails?.image[0])
          : "";
      const postVideo =
        Array.isArray(postdetails?.videos) && postdetails?.videos[0]
          ? String(postdetails?.videos[0])
          : "";

      if (reported) {
        reported?.ReportPost?.push({
          postId: new mongoose.Types.ObjectId(postid),
          postreportReason: text,
          userinfo: new mongoose.Types.ObjectId(userId),
          postcontent: postdetails?.description,
          postimage: postImage,
          postVideo: postVideo,
          postedBy: postdetails?.user.name,
          reportedBy: reported.name,
        });
      } else {
        throw new Error("issue with posting post report");
      }
      await reported.save();
      return reported;
    } catch (error) {
      console.error("Error updating post:", error);
    }
  }

  async changingpassword(
    email: string,
    password: string
  ): Promise<IUser | null> {
    const hashedPassword = await HashPassword.hashPassword(password);

    const Changepassword = await UserSchemadata.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
      }
    );

    return Changepassword;
  }

  async FindEmail(
    email: string | undefined
  ): Promise<IUser | undefined | null> {
    try {
      let getUser = await UserSchemadata.findOne({ email: email });
      return getUser;
    } catch (error) {
      console.log("error");
    }
  }

  async checkingmail(
    email: string | undefined
  ): Promise<IUser | undefined | null> {
    try {
      const otp = generateOtp();
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

  async getUserProfile(userId: unknown): Promise<IUser | undefined | null> {
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

  async getAllthedata(
    search: string,
    category: string,
    page: string | number
  ): Promise<{
    posts: Posts[];
    currentPage: string | number;
    totalPages: number;
  }> {
    const limit = 5;
    try {
      if (category === "Allpost") {
        const posts = await newspostSchemadata
          .aggregate([
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
          ])
          .skip((Number(page) - 1) * Number(limit))
          .limit(Number(limit));

        const totalPosts = await newspostSchemadata.countDocuments();

        if (posts.length === 0) {
          return { posts: [], currentPage: 0, totalPages: 0 };
        }
        return {
          posts,
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
        };
      } else if (category === "Latest news") {
        const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
        const latestposts = await newspostSchemadata
          .aggregate([
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
          ])
          .skip((Number(page) - 1) * limit)
          .limit(Number(limit));

        const totalPosts = await newspostSchemadata.countDocuments();

        if (latestposts.length === 0) {
          return { posts: [], currentPage: 0, totalPages: 0 };
        }

        return {
          posts: latestposts,
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
        };
      }
      const posts = await newspostSchemadata
        .aggregate([
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
        ])
        .skip((Number(page) - 1) * limit)
        .limit(Number(limit));

      const totalPosts = await newspostSchemadata.countDocuments();

      if (posts.length === 0) {
        return { posts: [], currentPage: 0, totalPages: 0 };
      }

      return {
        posts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
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

  async postidreceived(postId: string): Promise<void> {
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
      console.log(
        {
          postId,
          content,
          imageFiles,
          videoFiles,
        },
        "Data to be saved"
      );
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
  ): Promise<{
    savePosts: Posts | undefined;
    postNotify: IAllNotification | undefined;
  }> {
    try {
      const user = await UserSchemadata.findById(userId).populate("followers");
      if (!user) {
        throw new Error("User not found");
      }

      const newPost = new newspostSchemadata({
        user: user._id,
        description: content,
        category: Category,
        image: imageFiles.length ? imageFiles : [],
        videos: videoFiles.length ? videoFiles : [],
      });

      const savedPost = await newPost.save();

      const followerIds = user.followers.map((follower: any) =>
        follower._id.toString()
      );
      console.log("Follower IDs:", followerIds);

      const saveFollowerId = {
        userId: followerIds,
        postusername: user.name,
        image: imageFiles,
        followuserId: user._id,
      };

      const findNotify = new GetAllNotificationsSchema({
        PostNotifications: [saveFollowerId],
      });

      const savedNotification = await findNotify.save();
      console.log("Notification saved successfully:", savedNotification);

      // Return saved post and notification
      if (savedPost && savedNotification) {
        const postAndUser = await savedPost.populate("user");
        return {
          savePosts: postAndUser as Posts,
          postNotify: savedNotification as IAllNotification,
        };
      }

      return { savePosts: undefined, postNotify: undefined }; // Fallback return in case of missing data
    } catch (error) {
      console.error("Error while creating post:", error);
      return { savePosts: undefined, postNotify: undefined }; // Return fallback in case of errors
    }
  }

  async findUserData(userId: string): Promise<IUser | undefined> {
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
