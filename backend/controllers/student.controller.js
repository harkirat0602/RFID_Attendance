import { Class } from "../models/class.models.js";
import { Student } from "../models/students.model.js";



const registerstudent = async (req,res) => {
    const { rollno, firstname, lastname, dob, class_name } = req.body;

    console.log(req.body);

    if (
        [rollno, firstname, lastname, dob, class_name ].some((field)=> !field || field?.trim() ==="")
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
        dob: new Date(dob),
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


export{
    registerstudent
}