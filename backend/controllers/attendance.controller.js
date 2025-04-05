import { Subject } from "../models/subject.model.js";
import { getAttendanceState, startAttendance, stopAttendance } from "../utils/attendanceState.js";
import { Attendance } from "../models/attendance.model.js"



const startAttendanceController = async (req,res) => {
    const { subjectname, date } = req.body;
    // const subject = await Subject.findOne({name:subjectname.toLowerCase()})

    const subject = await Subject.aggregate([
        {
          $match: {
            name: "java"
          }
        },
        {
          $lookup: {
            from: "classes",
            localField: "_id",
            foreignField: "subjects",
            as: "class"
          }
        },
        {
          $project: {
            name: 1,
            _id: 1,
            code: 1,
            teacher: 1,
            class: {
              $map: {
                input: "$class",
                as: "class",
                in: {
                  name: "$$class.class_name",
                  teacher: "$$class._id" // Exclude only "grade"
                }
              }
            }
          }
        },
        {
          $addFields:
            /**
             * newField: The new field name.
             * expression: The new field expression.
             */
            {
              class: {
                $first: "$class"
              }
            }
        }
      ])


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

    date = date ? new Date(date) : new Date()

    const attendance = await Attendance.create(
        date, subject
    )

    startAttendance(attendance)

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