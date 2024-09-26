import { Request, Response } from "express";
import passportAuth from "../Googleauth/passport";
import { generateAccessToken } from "../utils/jwt";

import UserSchemadata from "../model/userModel";
import { userPayload } from "../interface/userInterface/userPayload";

interface AuthenticatedRequest  {
  user?: {
    email?: string;
    displayName?: string;
  };
}

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


export const authSuccess =async (req: AuthenticatedRequest, res: Response) => {

  try {
    if (!req.user) {
      return res.redirect("/auth/callback/failure");
    }
    const username = req.user.displayName;
    const email = req.user.email;

    const userdetails = await UserSchemadata.findOne({ email });

    console.log(userdetails, "user details get here...........");

    if (userdetails) {
      const userPayload: userPayload = {
        id: userdetails._id as unknown,
      };
      const tocken = generateAccessToken(userPayload);
      console.log(tocken, "tocken back end");

      res.redirect(`http://localhost:5173/homepage?tocken=${tocken}`);
    } else {
      console.log('reached hereeeeeee');
      const options = {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      };
      console.log(username,email,'pppppppppppppppppppppppppppppp');
      
      const userinfo = new UserSchemadata({
        name: username,
        email:email,
        password:0,
        isActive:false,
        isAdmin:false
      });
      const saveuser = await userinfo.save()
      if(saveuser){
        const userPayload: userPayload = {
          id: saveuser._id as unknown,
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






