import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { registersubject } from "../controllers/subject.controller.js";




const router = Router()

router.route('/register').post(verifyJWT,registersubject)



export default router