
import { Router } from "express";
import chatControllers from "../Controllers/Chatcontrollers";
import ChatServices from "../Services/Chatservices";
import chatRepository from "../Repository/Chatrepository";
import AuthenticationMiddleware from "../Middlewares/Userauthmiddleware";

const router = Router();
const chatRepo = new chatRepository();
const chatService = new ChatServices(chatRepo);
const chatcontroller = new chatControllers(chatService);

router.post("/",AuthenticationMiddleware,chatcontroller.accessChat.bind(chatcontroller));
router.post("/getgroup",AuthenticationMiddleware,chatcontroller.accessgroupChat.bind(chatcontroller));
router.get("/findfollowing",AuthenticationMiddleware,chatcontroller.getAllUser.bind(chatcontroller));
router.get("/findfollowers",AuthenticationMiddleware,chatcontroller.findAllFollowers.bind(chatcontroller));

router.get("/allmessages",AuthenticationMiddleware,chatcontroller.getAllmessages.bind(chatcontroller));
router.get("/getgroupchats",AuthenticationMiddleware,chatcontroller.getgroupchats.bind(chatcontroller));
router.get("/getusers",AuthenticationMiddleware,chatcontroller.getAllUsers.bind(chatcontroller));
router.get("/findallusers",AuthenticationMiddleware,chatcontroller.FindAllUser.bind(chatcontroller));
router.get("/findnotifications",AuthenticationMiddleware,chatcontroller.findnotifications.bind(chatcontroller));
router.get("/getnotifications",chatcontroller.getNotifications.bind(chatcontroller));
router.get("/getfollownotify",AuthenticationMiddleware,chatcontroller.getFollownotifications.bind(chatcontroller));
router.get("/getallpostnotify",AuthenticationMiddleware,chatcontroller.getallpostnotify.bind(chatcontroller));
router.get("/groupusers",AuthenticationMiddleware,chatcontroller.findAllUsers.bind(chatcontroller))
router.post("/creategroup",AuthenticationMiddleware,chatcontroller.CreateNewGroup.bind(chatcontroller));
router.post("/followuser",AuthenticationMiddleware,chatcontroller.followuser.bind(chatcontroller));
router.get("/getuserdata",AuthenticationMiddleware,chatcontroller.getUserDetails.bind(chatcontroller));
router.get("/getStatus",AuthenticationMiddleware,chatcontroller.blockUserStatus.bind(chatcontroller));

export default router;



















