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
router.get("/allmessages", AuthenticationMiddleware, async (req, res) =>chatcontroller.getAllmessages(req, res));


router.get("/findallusers", AuthenticationMiddleware, async (req, res) =>chatcontroller.FindAllUser(req, res)
);



router.get("/findFollowers", AuthenticationMiddleware, async (req, res) =>chatcontroller.findAllFollowers(req, res));

router.post("/followuser", AuthenticationMiddleware, async (req, res) =>chatcontroller.followuser(req, res));
router.get("/getUserdata", AuthenticationMiddleware, async (req, res) =>chatcontroller.getUserDetails(req, res));

router.get("/getStatus",AuthenticationMiddleware, async (req, res) =>chatcontroller.blockUserStatus(req, res));





// router.get("/chatId/:chatId/dataId/:dataId",AuthenticationMiddleware,async (req, res) => chatcontroller.fetchChat(req, res));
// router.post("/group",AuthenticationMiddleware, async (req, res) => chatcontroller.createGroupChat(req, res));
// router.put("/rename", AuthenticationMiddleware, async (req, res) =>chatcontroller.renameGroup(req, res));
// router.delete("/groupremove", async (req, res) => chatcontroller.removeFromGroup(req, res));
// router.put("/groupadd", async (req, res) =>chatcontroller.addToGroup(req, res));


 export default router



 
