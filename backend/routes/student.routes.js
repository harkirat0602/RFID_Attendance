import { Router } from "express";
import { deletestudent, getStudents, registerstudent } from "../controllers/student.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/adminauth.middleware.js";




const router = Router();


router.route("/register").post(verifyJWT,verifyAdmin,registerstudent)
router.route("/remove/:rollno").get(verifyJWT,verifyAdmin,deletestudent)
router.route("/getstudents/:classID").get(verifyJWT,getStudents)



export default router