import { Router } from "express";

import messageRepository from "../Repository/messageRepository";
import MessageServices from "../servises/messageServises";
import MessageControllers from "../controllers/MessageController";
import AuthenticationMiddleware from "../middlewares/userAuthmiddleware";
import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
const messageRepo = new messageRepository();
const messageServise = new MessageServices(messageRepo);
const MessageController = new MessageControllers(messageServise);

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

router.post(
  "/",
  AuthenticationMiddleware,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 2 },
  ]),
  async (req, res) =>{ const multerReq = req as Request & { files: { images?: Express.Multer.File[], videos?: Express.Multer.File[] } };
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
    }await MessageController.sendMessage(req, res)}
);

router.get("/:chatId", AuthenticationMiddleware, async (req, res) =>MessageController.allChats(req, res));
router.get("/getuserId/:userTocken", async (req, res) =>
  MessageController.getId(req, res)
);
router.get("/getuserimage/:chatId", async (req, res) =>
  MessageController.getUserInfo(req, res)
);

export default router;
