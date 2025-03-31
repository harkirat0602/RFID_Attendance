import { Router } from "express";
import { registerteacher } from "../controllers/teacher.controller.js";





const router = Router()

router.route("/register").post(registerteacher)




export default router