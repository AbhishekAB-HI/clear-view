import passport from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth2";
import dotenv from "dotenv";
import { Request } from "express";
import { GoogleProfile, User } from "../Types/Commontype/Googleauthinterface";

dotenv.config();


passport.serializeUser((user: User, done: (err: any, id?: any) => void) => {
  done(null, user);
});

passport.deserializeUser(
  (user: User, done: (err: any, user?: User) => void) => {
    done(null, user);
  }
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID as string, // Your Credentials here.
      clientSecret: process.env.CLIENT_SECRET as string, // Your Credentials here.
      callbackURL: "http://localhost:3000/auth/callback",
      passReqToCallback: true,
    },
    function (
      request: Request, // More specific type
      accessToken: string | undefined, // String or undefined
      refreshToken: string | undefined, // String or undefined
      profile: GoogleProfile, // More specific profile type
      done: VerifyCallback
    ) {
      // You can refine the profile handling here if needed
      return done(null, profile);
    }
  )
);

export default passport;
