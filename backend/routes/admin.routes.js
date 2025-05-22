import { Router } from "express";
import { getallclassesname, getallstudents } from "../controllers/admin.controller.js";
import { addNewClass, getAdminClasses } from "../controllers/class.controller.js";



const router = Router()


router.use('/getallstudents',getallstudents)
router.use('/getallclassesname',getallclassesname)
router.use("/getallclassesinfo",getAdminClasses)
router.route("/addnewclass").post(addNewClass)




export default router