import { Router } from "express";
import messageRepository from "../Repository/Messagerepository";
import MessageServices from "../Servises/Messageservises";
import MessageControllers from "../Controllers/MessageController";
import AuthenticationMiddleware from "../Middlewares/Userauthmiddleware";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { upload } from "../Config/Multerchatconfig";

const messageRepo = new messageRepository();
const messageServise = new MessageServices(messageRepo);
const MessageController = new MessageControllers(messageServise);

const router = Router();

router.post("/",AuthenticationMiddleware,upload.fields([{ name: "images", maxCount: 4 },{ name: "videos", maxCount: 4 },]),
async (req, res) => MessageController.sendMessage(req, res));
router.get("/:chatid", AuthenticationMiddleware, async (req, res) =>MessageController.allChats(req, res));
router.get("/getuserid/:usertocken", async (req, res) =>MessageController.getId(req, res));
router.get("/getuserimage/:chatid", async (req, res) =>MessageController.getUserInfo(req, res));
router.patch("/blockuser", AuthenticationMiddleware, async (req, res) =>MessageController.blockUserNow(req, res));

export default router;
