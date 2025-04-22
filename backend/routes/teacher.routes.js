import { Router } from "express";
import { changePassword, getClassesandSubjects, getlogininfo, loginteacher, logoutteacher, registerteacher, updateteacher } from "../controllers/teacher.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/adminauth.middleware.js";





const router = Router()

router.route("/register").post(verifyJWT,verifyAdmin,registerteacher)
router.route("/login").post(loginteacher)
router.route("/logout").get(verifyJWT,logoutteacher)
router.route("/getlogininfo").get(verifyJWT,getlogininfo)
router.route("/getclassinfo").get(verifyJWT,getClassesandSubjects)
router.route("/update-account").post(verifyJWT,updateteacher)
router.route("/change-password").post(verifyJWT,changePassword)



export default router