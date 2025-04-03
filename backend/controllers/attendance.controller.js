import { Subject } from "../models/subject.model.js";
import { getAttendanceState, startAttendance, stopAttendance } from "../utils/attendanceState.js";




const startAttendanceController = async (req,res) => {
    const { subjectname } = req.body;
    const subject = await Subject.findOne({name:subjectname.toLowerCase()})
    if(!subject){
        return res
        .status(402)
        .json({success:false, message: "No Subject Found"})
    }

    if(!subject.teacher._id.equals(req.teacher._id)){
        return res
        .status(420)
        .json({success:false, message: "This is not your subject"})
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