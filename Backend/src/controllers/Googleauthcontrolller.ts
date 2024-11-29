import { Request, Response } from "express";
import passportAuth from "../Googleauth/Passport";
import { generateAccessToken } from "../Utils/Jwt";
import UserSchemadata from "../Model/Usermodel";
import { userPayload } from "../Types/Commontype/TockenInterface";
import { ObjectId } from "mongoose";
import { AuthenticatedRequest } from "../Types/Commontype/Googleauthinterface";



declare module "express-session" {
  interface Session {
    username?: string;
  }
}

export const googleAuth = passportAuth.authenticate("google", {
  scope: ["email", "profile"],
});

export const googleAuthCallback = passportAuth.authenticate("google", {
  successRedirect: "/auth/callback/success",
  failureRedirect: "/auth/callback/failure",
});

export const authSuccess = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.redirect("/auth/callback/failure");
    }
    const username = req.user.displayName;
    const email = req.user.email;
    const userdetails = await UserSchemadata.findOne({ email });
    if (userdetails) {
      const userPayload: userPayload = {
        id: userdetails._id as ObjectId,
      };
      const tocken = generateAccessToken(userPayload);
      console.log(tocken, "tocken back end");

      res.redirect(`http://localhost:5173/homepage?tocken=${tocken}`);
    } else {
      const options = {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      };
      const userinfo = new UserSchemadata({
        name: username,
        email: email,
        password: 0,
        isActive: false,
        isAdmin: false,
      });
      const saveuser = await userinfo.save();
      if (saveuser) {
        const userPayload: userPayload = {
          id: saveuser._id as ObjectId,
        };
        const tocken = generateAccessToken(userPayload);
        console.log(tocken, "tocken back end");
        res.redirect(`http://localhost:5173/homepage?tocken=${tocken}`);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export const authFailure = (req: Request, res: Response) => {
  res.redirect(`http://localhost:5173/login`);
};
