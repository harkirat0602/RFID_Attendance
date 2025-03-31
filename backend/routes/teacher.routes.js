import { Router } from "express";
import { loginteacher, registerteacher } from "../controllers/teacher.controller.js";





const router = Router()

router.route("/register").post(registerteacher)
router.route("/login").post(loginteacher)




export default router