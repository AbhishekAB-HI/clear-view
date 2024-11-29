import { Router } from "express";
import UserController from "../Controllers/Usercontrollers";
import userRepository from "../Repository/Userrepository";
import userServises from "../Services/Userservices";
import dotenv from "dotenv";
import AuthenticationMiddleware from "../Middlewares/Userauthmiddleware";
import { upload } from "../config/Multerconfig";
dotenv.config();

const router = Router();
const newRepository = new userRepository();
const newUserservise = new userServises(newRepository);
const userController = new UserController(newUserservise);

// User Registration and Authentication

router.post("/register", userController.userRegister.bind(userController));
router.post("/login", userController.userLogin.bind(userController));
router.post("/verifyotp", userController.userCheckOtp.bind(userController));
router.patch("/resendotp", userController.resendotp.bind(userController));
router.patch(
  "/forgetpassword",
  userController.setforgetpass.bind(userController)
);
router.post(
  "/forgetmail",
  userController.verifymailforget.bind(userController)
);
router.post("/verifyforgetotp", userController.forgetotp.bind(userController));
router.post(
  "/auth/refreshtoken",
  userController.refreshTocken.bind(userController)
);
router.patch(
  "/updatePassword",
  AuthenticationMiddleware,
  userController.updatePassword.bind(userController)
);

// Post Interactions

router.patch(
  "/likepost",
  AuthenticationMiddleware,
  userController.LikePost.bind(userController)
);
router.patch(
  "/commentpost",
  AuthenticationMiddleware,
  userController.commentPost.bind(userController)
);
router.post(
  "/replycomment",
  AuthenticationMiddleware,
  userController.replycommentPost.bind(userController)
);
router.get(
  "/getreplys",
  AuthenticationMiddleware,
  userController.getReplyComments.bind(userController)
);
router.patch(
  "/reportpost",
  AuthenticationMiddleware,
  userController.ReportPost.bind(userController)
);
router.patch(
  "/updatelastseen",
  AuthenticationMiddleware,
  userController.userLastseen.bind(userController)
);
router.get(
  "/allposts",
  AuthenticationMiddleware,
  userController.getAllPost.bind(userController)
);
router.delete(
  "/deletepost/:id",
  AuthenticationMiddleware,
  userController.deletePost.bind(userController)
);
router.post(
  "/createpost",
  AuthenticationMiddleware,
  upload.fields([
    { name: "images", maxCount: 4 },
    { name: "videos", maxCount: 4 },
  ]),
  userController.createPost.bind(userController)
);
router.post(
  "/editpost",
  AuthenticationMiddleware,
  upload.fields([
    { name: "images", maxCount: 4 },
    { name: "videos", maxCount: 4 },
  ]),
  userController.editPost.bind(userController)
);

// User Interactions
router.get(
  "/getuserinfo",
  AuthenticationMiddleware,
  userController.getUserInfos.bind(userController)
);
router.patch(
  "/reportuser",
  AuthenticationMiddleware,
  userController.ReportTheUser.bind(userController)
);
router.get(
  "/getprofile",
  AuthenticationMiddleware,
  userController.getProfileview.bind(userController)
);
router.get(
  "/blockeduser",
  AuthenticationMiddleware,
  userController.getBlockedUsers.bind(userController)
);
router.get(
  "/getuserid",
  AuthenticationMiddleware,
  userController.getIduser.bind(userController)
);
router.get(
  "/userprofile",
  AuthenticationMiddleware,
  userController.userProfile.bind(userController)
);
router.get(
  "/searched",
  AuthenticationMiddleware,
  userController.allUsers.bind(userController)
);
router.get(
  "/userposts",
  AuthenticationMiddleware,
  userController.getuserPost.bind(userController)
);
router.post(
  "/updateprofile",
  AuthenticationMiddleware,
  upload.single("image"),
  userController.updateProfile.bind(userController)
);

export default router;
