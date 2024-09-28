import {Router} from "express";
import chatControllers from '../controllers/chatControllers'
import chatServises from '../servises/Chatservises'
import chatRepository from "../Repository/ChatRepository";
import AuthenticationMiddleware from "../middlewares/userAuthmiddleware";
const router = Router(); 

 const chatRepo = new chatRepository()
 const chatServise = new chatServises(chatRepo)
 const chatcontroller = new chatControllers(chatServise)

router.post("/",AuthenticationMiddleware, async (req, res) => chatcontroller.accessChat(req, res));
router.get("/allusers", AuthenticationMiddleware, async (req, res) => chatcontroller.getAllUser(req, res));
// router.get("/chatId/:chatId/dataId/:dataId",AuthenticationMiddleware,async (req, res) => chatcontroller.fetchChat(req, res));
// router.post("/group",AuthenticationMiddleware, async (req, res) => chatcontroller.createGroupChat(req, res));
// router.put("/rename", AuthenticationMiddleware, async (req, res) =>chatcontroller.renameGroup(req, res));
// router.delete("/groupremove", async (req, res) => chatcontroller.removeFromGroup(req, res));
// router.put("/groupadd", async (req, res) =>chatcontroller.addToGroup(req, res));


 export default router



 
