import { Router} from "express";
import UserController from "../Controllers/Usercontrollers";
import userRepository from "../Repository/Userrepository";
import userServises from "../Servises/Userservises";
import dotenv from "dotenv";
import AuthenticationMiddleware from "../Middlewares/Userauthmiddleware";
import { upload } from "../Config/Multerconfig";
dotenv.config();

const router = Router();
const newRepository = new userRepository();
const newUserservise = new userServises(newRepository);
const userController = new UserController(newUserservise);


// User Registration and Authentication

router.post("/register", async (req, res) => userController.userRegister(req, res));
router.post("/login", async (req, res) => userController.userLogin(req, res));
router.post("/verifyotp", async (req, res) =>userController.userCheckOtp(req, res));
router.patch("/resendotp", async (req, res) =>userController.resendotp(req, res));
router.patch("/forgetpassword", async (req, res) =>userController.setforgetpass(req, res));
router.post("/forgetmail", async (req, res) =>userController.verifymailforget(req, res));
router.post("/verifyforgetotp", async (req, res) =>userController.forgetotp(req, res));
router.post("/auth/refreshtoken", async (req, res) =>userController.refreshTocken(req, res));
router.patch("/updatePassword",AuthenticationMiddleware,async (req, res) => userController.updatePassword(req, res));


// Post Interactions
 
router.patch("/likepost",AuthenticationMiddleware, async (req, res) => userController.LikePost(req, res));
router.patch("/commentpost", AuthenticationMiddleware, async (req, res) =>userController.commentPost(req, res));
router.post("/replycomment", AuthenticationMiddleware, async (req, res) =>userController.replycommentPost(req, res));
router.get("/getreplys", AuthenticationMiddleware, async (req, res) =>userController.getReplyComments(req, res));
router.patch("/reportpost", AuthenticationMiddleware, async (req, res) =>
  userController.ReportPost(req, res)
);
router.patch("/updatelastseen", AuthenticationMiddleware, async (req, res) =>userController.userLastseen(req, res));
router.get("/allposts",AuthenticationMiddleware, async (req, res) =>userController.getAllPost(req, res));
router.delete("/deletepost/:id",AuthenticationMiddleware, async (req, res) =>userController.deletePost(req, res));
router.post("/createpost",AuthenticationMiddleware,upload.fields([{ name: "images", maxCount: 4 },{ name: "videos", maxCount: 4 },]),
async (req, res) =>  userController.createPost(req, res));
router.post("/editpost",AuthenticationMiddleware,upload.fields([{ name: "images", maxCount: 4 },{ name: "videos", maxCount: 4 },]),
  async (req, res) => userController.editPost(req, res)
);

// User Interactions
router.get("/getuserinfo", AuthenticationMiddleware, async (req, res) => userController.getUserInfos(req, res));
router.patch("/reportuser", AuthenticationMiddleware, async (req, res) =>userController.ReportTheUser(req, res));
router.get("/getprofile", AuthenticationMiddleware, async (req, res) =>userController.getProfileview(req, res));
router.get("/blockeduser", AuthenticationMiddleware, async (req, res) =>userController.getBlockedUsers(req, res));
router.get("/getuserid",AuthenticationMiddleware, async (req, res) =>userController.getIduser(req, res));
router.get("/userprofile", AuthenticationMiddleware, async (req, res) =>userController.userProfile(req, res));
router.get("/searched", AuthenticationMiddleware, async (req, res) =>userController.allUsers(req, res));
router.get("/userposts", AuthenticationMiddleware, async (req, res) =>userController.getuserPost(req, res));
router.post("/updateprofile",AuthenticationMiddleware,upload.single("image"),async (req, res) =>userController.updateProfile(req,res));


export default router;
