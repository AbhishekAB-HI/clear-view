import { error } from "console";
import {
  IUser,
  Checkuser,
  Confirmuser,
  tockens,
} from "../Entities/Userentities";
import { Posts, Postsget } from "../Entities/Postentities";
import { TokenResponce } from "../Interface/userInterface/Userdetail";
import { userPayload } from "../Interface/userInterface/Userpayload";
import userRepository from "../Repository/Userrepository";
import { generateAccessToken, generateRefreshToken } from "../Utils/Jwt";
import HashPassword from "../Utils/Hashpassword";
import { adminuserId } from "../Entities/Adminentities";
import mongoose, { ObjectId } from "mongoose";

class userServises {
  constructor(private userRepository: userRepository) {}

  async createUser(userData: Partial<IUser>): Promise<IUser | undefined> {
    if (!userData.email) {
      throw new Error("Email is required");
    }
    const exsistUser = await this.userRepository.findByEmail(userData.email);
    if (exsistUser) {
      throw new Error("Email already exist");
    }
    const RegisterUser = await this.userRepository.userRegister(userData);
    return RegisterUser;
  }

  async getUserInfoses(userId: unknown): Promise<IUser | undefined> {
    try {
      const getUser = await this.userRepository.findUserInfo(userId);

      if (!getUser) {
        throw new Error("No user found");
      }
      return getUser;
    } catch (error) {
      console.log(error);
    }
  }

  async verifyUser(userdata: Partial<Checkuser>): Promise<tockens | undefined> {
    if (!userdata.email) {
      throw new Error("Email is required");
    }
    if (!userdata.password) {
      throw new Error("password is required");
    }
    const verifyuser = await this.userRepository.checkByEmail(userdata);
    if (!verifyuser?.email) {
      throw new Error("User does not exist");
    }
    const checkisActive = await this.userRepository.checkByisActive(
      userdata.email
    );
    if (verifyuser?.isActive) {
      throw new Error("This User is blocked");
    }

    if (verifyuser?.password) {
      console.log(verifyuser?.password, "password,,,,,,,,,,,,,,");
      console.log("reached");
      console.log(userdata.password);

      const isPasswordValid = await HashPassword.comparePassword(
        userdata.password,
        verifyuser.password
      );

      console.log(isPasswordValid, "password,gethetr,,,,,,,,,,,,,");
      if (!isPasswordValid) {
        throw new Error("Wrong password");
      }
      if (isPasswordValid) {
        const userPayload: userPayload = {
          id: verifyuser._id as unknown,
        };
        let accessToken = generateAccessToken(userPayload);
        let refreshToken = generateRefreshToken(userPayload);
        console.log(accessToken, "accessTocken");
        console.log(refreshToken, "refreshTocken");
        return { accessToken: accessToken, refreshToken: refreshToken };
      }
    }
  }

  async verifymail(userdata: string): Promise<Confirmuser> {
    let getData = userdata;
    const checkEmail = await this.userRepository.FindEmail(getData);
    if (!checkEmail) {
      throw new Error("No user found");
    }
    const getUser = await this.userRepository.checkingmail(getData);
    if (!getUser) {
      throw new Error("Email did'nt match");
    }
    return getUser;
  }

  async verifyotp(otp: number, email: string): Promise<Checkuser> {
    console.log(otp, "get otp numbers");
    const getUser = await this.userRepository.checkingforgetotp(otp, email);

    return getUser;

    //  const getUser = await this.userRepository.checkingmail(getData);
  }

  async replyComments(
    commentId: string,
    replymessage: string,
    postId: string,
    userId: string,
    username: string
  ): Promise<Posts> {
    const getComment = await this.userRepository.replythecomment(
      commentId,
      replymessage,
      postId,
      userId,
      username
    );
    if (!getComment) {
      throw new Error("no comments get");
    }

    return getComment;
  }

  async userService() {}

  async getAllReplyhere(): Promise<Posts[]> {
    const findReply = await this.userRepository.findAllReply();

    if (!findReply || findReply.length === 0) {
      throw new Error("No posts found");
    }

    return findReply;
  }

  async sendReportReason(
    userId: string,
    text: string,
    logeduserId: string | unknown
  ) {
    try {
      const userDetails = await this.userRepository.sendTheReportReason(
        userId,
        text,
        logeduserId
      );
    } catch (error) {
      console.log(error);
    }
  }

  async passProfileid(
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
      const profileData = await this.userRepository.passProfileId(
        userId,
        page,
        limit
      );
      if (
        !profileData ||
        !profileData.userinfo ||
        !profileData.postinfo ||
        !profileData.totalpost
      ) {
        throw new Error("No user details found");
      }

      const { userinfo, postinfo, totalpost } = profileData;
      return {
        userinfo,
        postinfo,
        totalpost,
      };
    } catch (error) {
      console.log(error);
    }
  }

 

  async  findBlockedUsers(userId: unknown):Promise<IUser[]|undefined> {
    const blockedUsers = await this.userRepository.findBlockedUserinRepo(userId);
    if (!blockedUsers) {
      throw new Error("No post found");
    }
    return blockedUsers;
  }

  async passLikePostID(postId: string, userId: mongoose.Types.ObjectId) {
    const LikedPost = await this.userRepository.LikethePost(postId, userId);
    if (!LikedPost) {
      throw new Error("No post found");
    }
    return LikedPost;
  }
  async passCommentPostID(
    postId: string,
    userId: mongoose.Types.ObjectId,
    comment: string
  ) {
    const commentPost = await this.userRepository.commentthePost(
      postId,
      userId,
      comment
    );
    if (!commentPost) {
      throw new Error("No post found");
    }
    return commentPost;
  }

  async passPostID(postId: string, text: string, userId: string) {
    const Reported = await this.userRepository.RepostPost(postId, text, userId);
    if (!Reported) {
      throw new Error("No post found");
    }

    return Reported;
  }

  async Changepassword(email: string, password: string): Promise<IUser> {
    console.log("reached servisessssssssssssssssss");

    const getUser = await this.userRepository.changingpassword(email, password);

    if (!getUser) {
      throw new Error("No user found");
    }
    return getUser;
  }

  async CheckOtp(
    userotp: number,
    email: string
  ): Promise<TokenResponce | undefined> {
    try {
      console.log("otp get on servise ", userotp);
      console.log("email get ", email);
      const RegisterUser = await this.userRepository.findotp(userotp, email);
      if (!RegisterUser) {
        throw new Error("User data didin't save");
      }
      const userPayload: userPayload = {
        id: RegisterUser.id,
      };
      const accessToken = await generateAccessToken(userPayload);
      const refreshToken = await generateRefreshToken(userPayload);

      console.log(accessToken, "access tocken ");
      console.log(refreshToken, "access tocken ");

      return { accessToken, refreshToken };
    } catch (error) {
      console.log(error);
    }
  }

  async sendResendotp(email: string) {
    try {
      if (!email) {
        throw new Error("No otp or email");
      }

      let getdetails = await this.userRepository.verifyresend(email);

      if (!getdetails) {
        throw new Error("No users");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async userIDget(userId: unknown): Promise<IUser | undefined> {
    try {
      let userProfile = await this.userRepository.getUserProfile(userId);

      if (!userProfile) {
        throw new Error("No user details get here");
      }

      return userProfile;
    } catch (error) {
      console.log(error);
    }
  }

  async getUserInfomations(userId: unknown): Promise<IUser | undefined> {
    try {
      const getuser = this.userRepository.getTheUser(userId);
      if (!getuser) {
        throw new Error("No user get");
      }
      return getuser;
    } catch (error) {
      console.log(error);
    }
  }

  async getBreakingNewsDetails(
    page: number,
    limit: number,
    search: string | any | string[] | any[] = ""
  ): Promise<{ total: number; posts: Posts[] | undefined }> {
    const { total, posts } = await this.userRepository.getAllbeeakingnews(
      page,
      limit,
      search
    );

    return {
      total,
      posts,
    };
  }

  async getpostdetails(search: string | any | string[] | any[] = "",category: string): Promise<{ posts: Posts[] | undefined }> {
    const {  posts } = await this.userRepository.getAllthedata(
      search,
      category
    );

    return {
      posts,
    };
  }

  async findSearchedusers(
    search: unknown,
    userId: unknown
  ): Promise<IUser[] | undefined> {
    try {
      let getAllusershere = await this.userRepository.getAlltheUsers(
        search,
        userId
      );

      if (!getAllusershere) {
        throw new Error("No user id or Search id found");
      }

      return getAllusershere;
    } catch (error) {
      console.log(error);
    }
  }

  async sendPostid(postId: string) {
    try {
      let getpostid = await this.userRepository.postidreceived(postId);
      return getpostid;
    } catch (error) {
      console.log(error);
    }
  }

  async postuserIDget(
    userId: unknown,
    page: number,
    limit: number
  ): Promise<{ posts: Posts[]; total: number } | undefined> {
    try {
      let userProfile = await this.userRepository.getPostUserData(
        userId,
        page,
        limit
      );
      if (!userProfile || !userProfile.posts || !userProfile.total) {
        throw new Error("No user details or posts get here");
      }
      const { posts, total } = userProfile;
      return { posts, total };
    } catch (error) {
      console.log(error);
    }
  }

  async editDetailsdata(
    content: string,
    postId: string,
    imageFiles: string[],
    videoFiles: string[]
  ): Promise<Posts | undefined> {
    try {
      let userProfile = await this.userRepository.findeditpostdetails(
        postId,
        content,
        imageFiles,
        videoFiles
      );
      if (!userProfile) {
        throw new Error("No user details get here");
      }

      return userProfile;
    } catch (error) {}
  }

  async postDetailsdata(
    userId: string,
    content: string,
    Category: string,
    imageFiles: string[],
    videoFiles: string[]
  ): Promise<Posts | undefined> {
    try {
      let userProfile = await this.userRepository.findUserdetails(
        userId,
        content,
        Category,
        imageFiles,
        videoFiles
      );
      if (!userProfile) {
        throw new Error("No user details get here");
      }

      return userProfile;
    } catch (error) {}
  }

  async PassUserDetails(userId: string, password: string, newpassword: string) {
    try {
      const findUser = await this.userRepository.findUserData(userId);

      if (!findUser) {
        throw new Error("No Data is found");
      }
      const checkpassword = await HashPassword.comparePassword(
        password,
        findUser.password
      );

      if (!checkpassword) {
        throw new Error("Incorrect password. Please try again.");
      }
      const newpasswordhashed = await HashPassword.hashPassword(newpassword);
      const updateduser = await this.userRepository.updateUserpassword(
        userId,
        newpasswordhashed
      );
    } catch (error) {
      console.log(error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "An error occurred while updating profile"
      );
    }
  }

  async userDetailsdata(
    name: string,
    image: string,
    userid: string
  ): Promise<IUser | undefined> {
    try {
      const updateduser = await this.userRepository.updateUserProfile(
        name,
        image,
        userid
      );
      if (!updateduser) {
        throw new Error("Failed to update user");
      }
      return updateduser;
    } catch (error) {
      console.error("Service error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "An error occurred while updating profile"
      );
    }
  }
}

export default userServises;
