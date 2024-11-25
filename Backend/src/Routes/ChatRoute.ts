import { Router } from "express";
import chatControllers from "../Controllers/Chatcontrollers";
import chatServises from "../Servises/Chatservises";
import chatRepository from "../Repository/Chatrepository";
import AuthenticationMiddleware from "../Middlewares/Userauthmiddleware";

const router = Router();
const chatRepo = new chatRepository();
const chatServise = new chatServises(chatRepo);
const chatcontroller = new chatControllers(chatServise);

router.post("/", AuthenticationMiddleware, async (req, res) =>
  chatcontroller.accessChat(req, res)
);

router.post("/getgroup", AuthenticationMiddleware, async (req, res) =>
  chatcontroller.accessgroupChat(req, res)
);

router.get("/allusers", AuthenticationMiddleware, async (req, res) =>
  chatcontroller.getAllUser(req, res)
);

router.get("/allmessages", AuthenticationMiddleware, async (req, res) =>
  chatcontroller.getAllmessages(req, res)
);

router.get("/getgroupchats", AuthenticationMiddleware, async (req, res) =>
  chatcontroller.getgroupchats(req, res)
);

router.get("/getusers", AuthenticationMiddleware, async (req, res) =>
  chatcontroller.getAllUsers(req, res)
);

router.get("/findallusers", AuthenticationMiddleware, async (req, res) =>
  chatcontroller.FindAllUser(req, res)
);

router.get("/findfollowers", AuthenticationMiddleware, async (req, res) =>
  chatcontroller.findAllFollowers(req, res)
);

router.get("/findnotifications", AuthenticationMiddleware, async (req, res) =>
  chatcontroller.findnotifications(req, res)
);

router.get("/getnotifications", async (req, res) => {
  chatcontroller.getNotifications(req, res);
});

router.get("/getfollownotify", AuthenticationMiddleware, async (req, res) => {
  chatcontroller.getFollownotifications(req, res);
});

router.get("/getallpostnotify", AuthenticationMiddleware, async (req, res) => {
  chatcontroller.getallpostnotify(req, res);
});

router.get("/groupusers", AuthenticationMiddleware, async (req, res) =>
  chatcontroller.findAllUsers(req, res)
);

router.post("/creategroup", AuthenticationMiddleware, async (req, res) =>
  chatcontroller.CreateNewGroup(req, res)
);

router.post("/followuser", AuthenticationMiddleware, async (req, res) =>
  chatcontroller.followuser(req, res)
);

router.get("/userstatus", AuthenticationMiddleware, async (req, res) =>
  chatcontroller.getuserstatus(req, res)
);

router.get("/getuserdata", AuthenticationMiddleware, async (req, res) =>
  chatcontroller.getUserDetails(req, res)
);

router.get("/getStatus", AuthenticationMiddleware, async (req, res) =>
  chatcontroller.blockUserStatus(req, res)
);

export default router;
