import { Router } from "express";
import messageRepository from "../Repository/Messagerepository";
import MessageServices from "../Services/Messageservices";
import MessageControllers from "../Controllers/MessageController";
import AuthenticationMiddleware from "../Middlewares/Userauthmiddleware";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { upload } from "../Config/Multerchatconfig";

const messageRepo = new messageRepository();
const messageServise = new MessageServices(messageRepo);
const MessageController = new MessageControllers(messageServise);

const router = Router();

router.post("/",AuthenticationMiddleware,upload.fields([{ name: "images", maxCount: 4 },{ name: "videos", maxCount: 4 },]), MessageController.sendMessage.bind(MessageController));
router.get("/:chatid",AuthenticationMiddleware,MessageController.allChats.bind(MessageController));
router.get("/getuserid/:usertocken",MessageController.getId.bind(MessageController));
router.get("/getuserimage/:chatid",  MessageController.getUserInfo.bind(MessageController));
router.patch("/blockuser",AuthenticationMiddleware,MessageController.blockUserNow.bind(MessageController));

export default router;
