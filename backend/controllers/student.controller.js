import mongoose from "mongoose";
import { Class } from "../models/class.models.js";
import { Student } from "../models/students.model.js";
import { Attendance } from "../models/attendance.model.js";



const ObjectId = mongoose.Types.ObjectId;

const registerstudent = async (req,res) => {
    const { rollno, firstname, lastname, dob, class_name } = req.body;

    console.log("Rollno: ",rollno, "FirstName: ",firstname,"LastName:",lastname,dob,class_name)
    if (
        [rollno, firstname, lastname, class_name ].some((field)=> !field || field?.trim() ==="")
    ) {
        return res
        .status(400)
        .json({success:false, message: "All fields are required"})
    }

    const classobj = await Class.findOne({class_name})

    if (!classobj){
        return res
        .status(400)
        .json({success:false, message: "Class doesnot Exist"})
    }

    var student = await Student.findOne({rollno});

    if(student){
        return res
        .status(400)
        .json({success:false, message: "This Student already exists"})
    }

    student = await Student.create({
        firstname,
        lastname,
        rollno,
        dob: dob? new Date(dob): undefined,
        class: classobj._id
    });

    const newstudent = await Student.findById(student._id);

    if(!newstudent){
        return res
        .status(500)
        .json({success:false, message: "Error while creating new student"})
    }


    return res
    .status(200)
    .json({success:true, message: "Student created successfully"})


}


const deletestudent = async (req,res) => {
    const { rollno } = req.params;

    const student = await Student.findOne({rollno});
    if (student==null){
        return res
        .status(400)
        .json({success:false, message: "No Student found with the rollno"})
    }

    const result = await Student.deleteOne({rollno});
    

    if (result.acknowledged){
        return res
        .status(200)
        .json({success:true, message: "Student Object deleted successfully"})
    }else{
        return res
        .status(500)
        .json({success:false, message: "Error while deleting the Object"})
    }

}


const getStudents = async (req,res)=>{
  const {classID} = req.params;
  
  const students = await Student.aggregate([
    {
      $match:
        /**
         * query: The query in MQL.
         */
        {
          class: new ObjectId(
            classID
          )
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
          from: "classes",
          localField: "class",
          foreignField: "_id",
          as: "class"
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
    },
    {
      $project:
        /**
         * specifications: The fields to
         *   include or exclude.
         */
        {
          name: {
            $concat: [
              "$firstname",
              " ",
              "$lastname"
            ]
          },
          rollno: 1,
          class: "$class.class_name"
        }
    },
    {
      $sort:
        /**
         * Provide any number of field/order pairs.
         */
        {
          rollno: 1
        }
    }
  ])


    if (students){
        return res
        .status(200)
        .json({success:true, data: students})
    }else{
        return res
        .status(500)
        .json({success:false, message: "Error while fetching students"})
    }

}


const getStudentAttendance = async(req,res)=>{

  const { studentRoll, classID, subjectID } = req.body;

  const student = await Student.findOne({rollno: studentRoll})

  const attendanceList = await Attendance.aggregate([
    {
      $match:
        /**
         * query: The query in MQL.
         */
        {
          subject: new ObjectId(
            subjectID
          ),
          class: new ObjectId(
            classID
          )
        }
    },
    {
      $project:
        /**
         * specifications: The fields to
         *   include or exclude.
         */
        {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
              timezone: "Asia/Kolkata"
            }
          },
          isPresent: {
            $in: [
              new ObjectId(student._id),
              "$students"
            ]
          }
        }
    },
    {
      $group:
        /**
         * _id: The id of the group.
         * fieldN: The first field name.
         */
        {
          _id: null,
          dates: {
            $push: {
              $cond: [
                {$eq: ["$isPresent",true]},
                "$date",
                "$$REMOVE"
              ]
            }
          },
          presentCount: {
            $sum: {
              $cond: [
                {
                  $eq: ["$isPresent", true]
                },
                1,
                0
              ]
            }
          },
          totalCount: {
            $sum: 1
          }
        }
    }
  ])

  if (attendanceList){
    return res
    .status(200)
    .json({success:true, data: attendanceList[0]})
  }else{
    return res
    .status(500)
    .json({success:false, message: "Error while fetching Attendance"})
  }


}



export{
    registerstudent,
    deletestudent,
    getStudents,
    getStudentAttendance
}