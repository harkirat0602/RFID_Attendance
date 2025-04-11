import { Router } from "express";
import { getallclasses, getallstudents } from "../controllers/admin.controller.js";



const router = Router()


router.use('/getallstudents',getallstudents)
router.use('/getallclasses',getallclasses)



export default router