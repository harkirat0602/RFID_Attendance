import { Router } from "express";
import { loginteacher, registerteacher } from "../controllers/teacher.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/adminauth.middleware.js";





const router = Router()

router.route("/register").post(verifyJWT,verifyAdmin,registerteacher)
router.route("/login").post(loginteacher)




export default router