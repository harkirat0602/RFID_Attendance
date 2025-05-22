import { Student } from '../models/students.model.js'
import { Class } from "../models/class.models.js"



const getallstudents = async(req,res)=>{
    const students = await Student.aggregate([
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
              class: "$class.class_name",
              dob:1
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

    return res
    .status(200)
    .json({success:true, data: students})
}


const getallclassesname = async(req,res)=>{
  const classnames = await Class.find().distinct('class_name');

  console.log(classnames);

  return res
    .status(200)
    .json({success:true, data: classnames})
}



export {
    getallstudents,
    getallclassesname
}