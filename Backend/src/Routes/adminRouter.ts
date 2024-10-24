import { Router } from "express";
import AdminController from "../Controllers/Admincontrollers";
import AdminServices from "../Servises/Adminservises";
import adminRepository from "../Repository/Adminrepository";

const adminrepository = new adminRepository();
const adminservises = new AdminServices(adminrepository);
const admincontroller = new AdminController(adminservises);

const router = Router();

router.post("/adminlogin", async (req, res) =>
  admincontroller.adminLogin(req, res)
);
router.get("/admindashboardget", async (req, res) =>
  admincontroller.adminHomePage(req, res)
);
router.patch("/blockuser", async (req, res) =>
  admincontroller.handleBlocking(req, res)
);
router.get("/getpost", async (req, res) =>
  admincontroller.getAllpost(req, res)
);
router.get("/getReportpost", async (req, res) =>
  admincontroller.getAllReportPost(req, res)
);
router.get("/getReportuser", async (req, res) =>
  admincontroller.getAllReportUsers(req, res)
);

router.delete("/deletepost/:id", async (req, res) =>
  admincontroller.deletePost(req, res)
);

router.delete("/deleteReportpost/:postid", async (req, res) =>
  admincontroller.deleteReportPost(req, res)
);

export default router;
