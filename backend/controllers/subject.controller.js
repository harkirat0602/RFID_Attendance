import { Subject } from "../models/subject.model.js";




const registersubject = async(req,res)=>{

    const { name, code } = req.body;

    if (
        [ name,code ].some((field)=> !field || field?.trim() ==="")
    ) {
        return res
        .status(400)
        .json({success:false, message: "All fields are required"})
    }
    

    const existingSubject = await Subject.findOne({name:name.toLowerCase()});

    if(existingSubject){
        return res
        .status(400)
        .json({success:false, message: "Subject Name already Used"})
    }


    const newSubject = await Subject.create({
        name:name.toLowerCase(),
        code,
        teacher: req.teacher._id
    })

    const createdSubject = await Subject.findById(newSubject._id)

    if(!createdSubject){
        return res
        .status(500)
        .json({success:false, message: "Error while creating subject Object"})
    }

    return res
        .status(200)
        .json({success:true, message: "Subject created Successsfully", data: createdSubject})


}






export {
    registersubject
}