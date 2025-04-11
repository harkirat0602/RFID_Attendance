import { Subject } from "../models/subject.model.js";
import { getAttendanceState, startAttendance, stopAttendance } from "../utils/attendanceState.js";
import { Attendance } from "../models/attendance.model.js"
import { Class } from "../models/class.models.js";
import mongoose from "mongoose";



const ObjectId = mongoose.Types.ObjectId;

const startAttendanceController = async (req,res) => {
    const { subjectID, givendate, classID  } = req.body;
    // const subject = await Subject.findOne({name:subjectname.toLowerCase()})

    // const subject = await Subject.aggregate([
    //     {
    //       $match: {
    //         name: "java"
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: "classes",
    //         localField: "_id",
    //         foreignField: "subjects",
    //         as: "class"
    //       }
    //     },
    //     {
    //       $project: {
    //         name: 1,
    //         _id: 1,
    //         code: 1,
    //         teacher: 1,
    //         class: {
    //           $map: {
    //             input: "$class",
    //             as: "class",
    //             in: {
    //               name: "$$class.class_name",
    //               teacher: "$$class._id" // Exclude only "grade"
    //             }
    //           }
    //         }
    //       }
    //     },
    //     {
    //       $addFields:
    //         /**
    //          * newField: The new field name.
    //          * expression: The new field expression.
    //          */
    //         {
    //           class: {
    //             $first: "$class"
    //           }
    //         }
    //     }
    //   ])

    const subject = await Subject.findById(subjectID);
    const classobj = await Class.findById(classID);


    if(!subject){
        return res
        .status(402)
        .json({success:false, message: "No Subject Found"})
    }
    if(!classobj){
      return res
      .status(402)
      .json({success:false, message: "No Class Found"})
  }

    if(!subject.teacher._id.equals(req.teacher._id)){
        return res
        .status(420)
        .json({success:false, message: "This is not your subject"})
    }

    subject.class = classobj;

    const date = givendate ? new Date(givendate) : new Date()

    date.setHours(0,0,0,0);

    var attendance = await Attendance.findOne({date,subject,class:classobj});

    if(!attendance){
      attendance = await Attendance.create({
        date, subject, class:classobj
    })
  }


    

    startAttendance(subject,attendance)

    console.log("Attendanace Started for ",getAttendanceState().subject.name);


    return res.status(200).json({success:true, attendanceid: attendance._id})
}

const stopAttendanceController = (req,res) => {
    console.log(`Stopping Attendance for ${getAttendanceState().subject.name}`)
    stopAttendance();

    return res
        .status(200)
        .json({success:true,message:"Attendance Stopped"})
}


const getAttendance = async(req,res)=>{
  const {attendanceid} = req.params;

  const attendance = await Attendance.aggregate([
    {
      $match:
        /**
         * query: The query in MQL.
         */
        {
          _id: new ObjectId(attendanceid)
        }
    },
    {
      $lookup:
        /**
         * from: The target collection.
         * localField: The local join field.
         * foreignField: The target join field.
         * as: The name for the results.
         * pipeline: Optional pipeline to run on the foreign collection.
         * let: Optional variables to use in the pipeline field stages.
         */
        {
          from: "students",
          localField: "students",
          foreignField: "_id",
          as: "students"
        }
    }
  ])

  // console.log(attendance[])

  if (attendance){
    return res
    .status(200)
    .json({success:true, data: attendance[0].students})
}else{
    return res
    .status(500)
    .json({success:false, message: "Error while fetching students"})
}




}


export {
    startAttendanceController,
    stopAttendanceController,
    getAttendance
}