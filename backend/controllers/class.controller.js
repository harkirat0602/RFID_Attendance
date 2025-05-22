import { Class } from "../models/class.models.js"
import { Subject } from "../models/subject.model.js"




const getAdminClasses = async(req,res)=>{

    const data = await Class.aggregate([
        {
          '$lookup': {
            'from': 'subjects', 
            'localField': 'subjects', 
            'foreignField': '_id', 
            'as': 'subjects'
          }
        }, {
          '$lookup': {
            'from': 'students', 
            'let': {
              'cid': '$_id'
            }, 
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$eq': [
                      '$class', '$$cid'
                    ]
                  }
                }
              }, {
                '$count': 'studentCount'
              }
            ], 
            'as': 'result'
          }
        }, {
          '$addFields': {
            'studentCount': {
              '$ifNull': [
                {
                  '$arrayElemAt': [
                    '$result.studentCount', 0
                  ]
                }, 0
              ]
            }
          }
        }, {
          '$project': {
            '_id': 1, 
            'class_name': 1, 
            'subjects': 1, 
            'studentCount': 1
          }
        }
      ])


    if (data){
        return res
        .status(200)
        .json({success:true, data})
    }else{
        return res
        .status(500)
        .json({success:false, message: "Error while fetching Classes"})
    }

}


const addNewClass = async(req,res)=>{
  const { class_name,subjects,year } = req.body;

  if (
    [ class_name ].some((field)=> !field || field?.trim() ==="") || subjects.length < 0
  ) {
    return res
    .status(400)
    .json({success:false, message: "All fields are required"})
  }

  const old_obj = await Class.findOne({class_name})

  if (old_obj){
    return res
    .status(420)
    .json({success:false, message: "Class Already Exists"})
  }

  const sub_objs = await Promise.all(subjects.map(async(id)=>(await Subject.findById(id))))
  // console.log(sub_objs);

  const new_class_obj = await Class.create({
    class_name,
    subjects: sub_objs,
    year
  })


  const created_class = await Class.findById(new_class_obj._id);

  if(!created_class){
      return res
      .status(500)
      .json({success:false, message: "Error while creating new Class"})
  }


  return res
  .status(200)
  .json({success:true, message: "New Class created successfully"})
}


export{
    getAdminClasses,
    addNewClass
}