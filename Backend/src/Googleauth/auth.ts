import express, { Request, Response } from "express";
import passport from "passport";
import cookieSession from "cookie-session";
import "./passport"; // Ensure that your passport configuration file is TypeScript-compatible

const app = express();

app.use(
  cookieSession({
    name: "google-auth-session",
    keys: ["key1", "key2"],
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req: Request, res: Response) => {
  res.send("<button><a href='/auth'>Login With Google</a></button>");
});

// Auth
app.get(
  "/auth",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// Auth Callback
app.get(
  "/auth/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/callback/success",
    failureRedirect: "/auth/callback/failure",
  })
);

// Success
app.get("/auth/callback/success", (req: Request, res: Response) => {
  if (!req.user) {
    return res.redirect("/auth/callback/failure");
  }
  res.send("Welcome " + (req.user as Express.User).email);
});

// Failure
app.get("/auth/callback/failure", (req: Request, res: Response) => {
  res.send("Error");
});

app.listen(4000, () => {
  console.log("Server Running on port 4000");
});
