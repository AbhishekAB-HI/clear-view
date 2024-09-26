import passport from "passport";
import {Strategy as GoogleStrategy, VerifyCallback} from "passport-google-oauth2";
import dotenv from "dotenv";

dotenv.config();

interface User {
  id?: string;
  email?: string;
  displayName?: string;
}

passport.serializeUser((user: User, done: any) => {
  done(null, user);
});
passport.deserializeUser(function (user: string, done: any) {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID as string, // Your Credentials here.
      clientSecret: process.env.CLIENT_SECRET as string, // Your Credentials here.
      callbackURL: "http://localhost:3000/auth/callback",
      passReqToCallback: true,
    },
    function (
      request: any,
      accessToken: any,
      refreshToken: any,
      profile: any,
      done: VerifyCallback
    ) {
      return done(null, profile);
    }
  )
);

export default passport
