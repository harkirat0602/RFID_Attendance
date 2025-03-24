import { Router } from "express";
import { startAttendanceController, stopAttendanceController } from "../controllers/attendance.controller.js";


const router = Router();


router.route('/start').post(startAttendanceController)
router.route('/stop').get(stopAttendanceController)

export default router