import { Subject } from "../models/subject.model.js";
import { getAttendanceState, startAttendance, stopAttendance } from "../utils/attendanceState.js";




const startAttendanceController = async (req,res) => {
    const { subjectname } = req.body;
    const subject = await Subject.findOne({name:subjectname})
    if(!subject){
        return res
        .status(402)
        .json({success:false, message: "No Subject Found"})
    }
    startAttendance(subject)

    console.log("Attendanace Started for ",subject.name);


    return res.status(200).json({success:true})
}

const stopAttendanceController = (req,res) => {
    console.log(`Stopping Attendance for ${getAttendanceState().subject.name}`)
    stopAttendance();

    return res
        .status(200)
        .json({success:true,message:"Attendance Stopped"})
}


export {
    startAttendanceController,
    stopAttendanceController
}