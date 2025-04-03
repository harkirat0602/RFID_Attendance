import { Router } from "express";
import { startAttendanceController, stopAttendanceController } from "../controllers/attendance.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();


router.route('/start').post(verifyJWT,startAttendanceController)
router.route('/stop').get(verifyJWT,stopAttendanceController)

export default router