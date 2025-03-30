import { Router } from "express";
import { registerstudent } from "../controllers/student.controller.js";




const router = Router();


router.route("/register").post(registerstudent)



export default router