
import { Router,Request,Response } from "express";
import UserController from "../controllers/userControllers";
import userRepository from "../Repository/userRepository";
import userServises from "../servises/userServises";
import multer, { Multer } from "multer";
import path from 'path'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { generateAccessToken } from "../utils/jwt";
import AuthenticationMiddleware from "../middlewares/userAuthmiddleware";

 dotenv.config()

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../images"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file to avoid name conflicts
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // Set file size limit to 500MB (adjust as needed)
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|avi|mov/; // Add allowed file types
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images and videos are allowed."));
    }
  },
});

const router = Router();
const newRepository = new userRepository();
const newUserservise = new userServises(newRepository); 
const userController = new UserController(newUserservise);


const REFRESH_TOKEN_PRIVATE_KEY = "key_for_refresht";


// user login routes-------------------------------------------------------------------------

router.post("/register",async (req,res) => userController.userRegister(req,res));
router.post("/verify-otp", async (req, res) => userController.userCheckOtp(req, res));
router.patch("/resend-otp", async (req, res) =>userController.resendotp(req, res));
router.post("/login", async (req, res) =>userController.userLogin(req, res));
router.post("/forgetmail", async (req, res) => userController.verifymailforget(req, res));
router.post("/verifyforgetotp", async (req, res) =>userController.forgetotp(req, res));
router.patch("/setforgetpass", async (req, res) =>userController.setforgetpass(req, res));
router.patch("/Reportpost", async (req, res) =>userController.ReportPost(req, res));







// user login routes-------------------------------------------------------------------------


// refresh tocken route-------------------------------------------------------------

router.post("/auth/refresh-token",async(req,res)=>{
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh Token required" });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_PRIVATE_KEY, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Token expired or invalid" });
    }
    const newAccessToken = generateAccessToken({ id: user.id });
    res.json({ accessToken: newAccessToken });
  });

  // refresh tocken route-------------------------------------------------------------
});




// user logined info -------------------------------------------------------------------------------------


router.get("/userprofile", AuthenticationMiddleware, async (req, res) =>
  userController.userProfile(req, res)
);

router.get("/getAllpost", async (req, res) =>userController.getAllPost(req, res));

router.get("/searched",AuthenticationMiddleware, async (req, res) => userController.allUsers(req, res));

router.get("/userposts", AuthenticationMiddleware, async (req, res) =>userController.getuserPost(req, res));

router.delete("/deletepost/:id", async (req, res) =>userController.deletePost(req, res));


router.post(
  "/updateProfile",
  AuthenticationMiddleware,upload.single("image"),
  async (req: Request, res: Response) => {
    const multerReq = req as MulterRequest;
    if (multerReq.file) {
      console.log("Uploaded file:", multerReq.file);
    } else {
      console.log("No file received");
    }
    await userController.updateProfile(multerReq, res);
  }
);


router.post("/createpost",AuthenticationMiddleware, 
  upload.fields([
    { name: "images", maxCount: 10 }, 
    { name: "videos", maxCount: 2 }   
  ]), 
  async (req: Request, res: Response) => {
    const multerReq = req as Request & { files: { images?: Express.Multer.File[], videos?: Express.Multer.File[] } };
    if (multerReq.files?.images) {
      multerReq.files.images.forEach((file) => {
        console.log("Uploaded image file:", file);
      });
    } else {
      console.log("No images received");
    }
    if (multerReq.files?.videos) {
      multerReq.files.videos.forEach((file) => {
        console.log("Uploaded video file:", file);
      });
    } else {
      console.log("No videos received");
    }
    await userController.createPost(multerReq, res);
  }
)

router.post(
  "/editpost",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 2 },
  ]),
  async (req: Request, res: Response) => {
    const multerReq = req as Request & {
      files: { images?: Express.Multer.File[]; videos?: Express.Multer.File[] };
    };
    if (multerReq.files?.images) {
      multerReq.files.images.forEach((file) => {
        console.log("Uploaded image file:", file);
      });
    } else {
      console.log("No images received");
    }
    if (multerReq.files?.videos) {
      multerReq.files.videos.forEach((file) => {
        console.log("Uploaded video file:", file);
      });
    } else {
      console.log("No videos received");
    }
    await userController.editPost(multerReq, res);
  }
);













// user logined info -------------------------------------------------------------------------------------











export default router






