import { Router } from "express";
import passportAuth from '../Googleauth/passport'
import {
  googleAuth,
  googleAuthCallback,
  authSuccess,
  authFailure,
} from "../controllers/Googleauthcontrolller";


const router: Router = Router();

router.get("/auth", googleAuth);
router.get("/auth/callback", googleAuthCallback);
router.get("/auth/callback/success", authSuccess);
router.get("/auth/callback/failure", authFailure);

export default router; 