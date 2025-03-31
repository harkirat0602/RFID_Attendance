import { Router } from "express";
import { deletestudent, registerstudent } from "../controllers/student.controller.js";




const router = Router();


router.route("/register").post(registerstudent)
router.route("/remove/:rollno").get(deletestudent)



export default router