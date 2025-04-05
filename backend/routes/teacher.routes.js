import { Router } from "express";
import { getlogininfo, loginteacher, logoutteacher, registerteacher } from "../controllers/teacher.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/adminauth.middleware.js";





const router = Router()

router.route("/register").post(verifyJWT,verifyAdmin,registerteacher)
router.route("/login").post(loginteacher)
router.route("/logout").get(verifyJWT,logoutteacher)
router.route("/getlogininfo").get(verifyJWT,getlogininfo)




export default router