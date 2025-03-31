import { Teacher } from "../models/teachers.model.js";





const registerteacher = async (req,res)=>{

    const { username, name, dob, password, isAdmin } = req.body;

     if(
        [username, name, password].some((field)=> !field || field?.trim()==="")
     ){
        return res
        .status(400)
        .json({success:false, message: "All fields are required"})
     }


    const existingusername = await Teacher.findOne({username});

    if(existingusername){
        return res
        .status(400)
        .json({success:false, message: "Username already Exists"})
    }


    const teacher = await Teacher.create({
        username: username.toLowerCase(),
        name,
        dob: new Date(dob || "2000-01-01"),
        password,
        isAdmin
    })

    const createdteacher = await Teacher.findById(teacher._id).select("-password -refreshToken");

    if(!createdteacher){
        return res
        .status(500)
        .json({success:false, message: "Error while registering teacher"})
    }

    return res
        .status(200)
        .json({success:false, message: "Teacher registered successfully", data: createdteacher})

}





export {
    registerteacher
}