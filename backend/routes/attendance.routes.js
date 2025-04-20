import { Router } from "express";
import { getAttendance, getAttendanceByClass, getDayAttendance, startAttendanceController, stopAttendanceController } from "../controllers/attendance.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();


router.route('/start').post(verifyJWT,startAttendanceController)
router.route('/stop').get(verifyJWT,stopAttendanceController)
router.route('/getattendance/bydate').post(verifyJWT,getDayAttendance)
router.route('/getattendance/:attendanceid').get(verifyJWT,getAttendance)
router.route('/getbyclass/:classID/:subjectID').get(verifyJWT,getAttendanceByClass)

export default router