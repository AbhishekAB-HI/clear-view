import { Router } from "express";
import AdminController from "../Controllers/Admincontrollers";
import AdminServices from "../Services/Adminservices";
import adminRepository from "../Repository/adminRepository";

const adminrepository = new adminRepository();
const adminservises = new AdminServices(adminrepository);
const admincontroller = new AdminController(adminservises);
const router = Router();

router.post("/adminlogin",admincontroller.adminLogin.bind(admincontroller));
router.get("/admindashboard",admincontroller.adminHomePage.bind(admincontroller))
router.get("/userscounts", admincontroller.getalldetails.bind(admincontroller));
router.patch("/blockusers",admincontroller.handleBlocking.bind(admincontroller));
router.get("/getposts", admincontroller.getAllpost.bind(admincontroller))
router.get("/getreportposts", admincontroller.getAllReportPost.bind(admincontroller));
router.get("/getreportusers",admincontroller.getAllReportUsers.bind(admincontroller));
router.delete("/deletepost/:id",admincontroller.deletePost.bind(admincontroller));
router.delete("/deleteReportpost",admincontroller.deleteReportPost.bind(admincontroller));

export default router;
