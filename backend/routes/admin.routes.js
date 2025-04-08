import { Router } from "express";
import { getallstudents } from "../controllers/admin.controller.js";



const router = Router()


router.use('/getallstudents',getallstudents)



export default router