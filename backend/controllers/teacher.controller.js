import mongoose from "mongoose";
import { Class } from "../models/class.models.js";
import { Teacher } from "../models/teachers.model.js";


const ObjectId = mongoose.Types.ObjectId

const generateTokens = async (teacherid) => {
    
    try {
        const teacherobj = await Teacher.findById(teacherid);
    
        const accesstoken = await teacherobj.generateAccessToken();
        const refreshtoken = await teacherobj.generateRefreshToken();
    
        teacherobj.refreshToken = refreshtoken;
    
        await teacherobj.save({ validateBeforeSave: false})
    
        return {accesstoken,refreshtoken}
    } catch (error) {
        throw error;
    }

}


const getClassesandSubjects = async (req,res)=>{

    const result = await Class.aggregate([
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
              from: "subjects",
              localField: "subjects",
              foreignField: "_id",
              as: "subjects"
            }
        },
        {
          $project:
            /**
             * specifications: The fields to
             *   include or exclude.
             */
            {
              class_name: 1,
              subjects: {
                $filter: {
                  input: "$subjects",
                  as: "subject",
                  cond: {
                    $eq: [
                      "$$subject.teacher",
                      new ObjectId(req.teacher._id)
                    ]
                  }
                }
              }
            }
        },
        {
          $match:
            /**
             * query: The query in MQL.
             */
            {
              "subjects.0": {
                $exists: true
              }
            }
        }
      ])


      return res
      .status(200)
      .json({
        success:true,
        data: result
      })

}




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



const loginteacher = async (req,res)=>{
    // find object with username
    // match the password 
    // generate Tokens
    // re-find user and remove password and refresh Token
    // set cookie option
    // return the response with cookies

    // console.log("Got login request");
    const {username, password} = req.body;

    if (!username){
        return res
        .status(400)
        .json({success:false, message: "Username is required"})
    }

    
    const teacher = await Teacher.findOne({username});

    if (!teacher){
        return res
        .status(400)
        .json({success:false, message: "Teacher with username not exists"})
    }

    const isPasswordValid = await teacher.isPasswordCorrect(password);

    if(!isPasswordValid){
        return res
        .status(400)
        .json({success:false, message: "Password Mismatch"})
    }


    const {accesstoken, refreshtoken} = await generateTokens(teacher._id);
    


    const loggedinteacher = await Teacher.findById(teacher._id).select("-password -refreshToken");


    const options = {
        httpOnly: true,
        secure: true
    };


    return res
        .status(200)
        .cookie("accessToken",accesstoken,options)
        .cookie("refreshToken",refreshtoken,options)
        .json({success:true, message: "Teacher Logged In Successsfully",data: loggedinteacher})


}



const logoutteacher = async(req, res) =>{

    await Teacher.findByIdAndUpdate(
        req.teacher._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new : true
        }
    )


    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json({success:true, message:"Teacher Logged out"})

}

const getlogininfo = async (req,res)=>{
    return res
        .status(200)
        .json({success:true, data:req.teacher})
}


const updateteacher = async(req,res)=>{

  const {name, username, dob} = req.body;

  if(
    [username, name, dob].some((field)=> !field || field?.trim()==="")
 ){
    return res
    .status(400)
    .json({success:false, message: "All fields are required"})
 }


  const teacher = await Teacher.findByIdAndUpdate(
    req.teacher._id,
    {
      $set: {
        name, username, dob: new Date(dob)
      }
    },
    {new:true}
  ).select("-password -refreshToken")


  return res
        .status(200)
        .json({success:true, data:teacher})

}



const changePassword= async(req,res)=>{

  const {oldPassword, newPassword} = req.body;

  if(
    [oldPassword,newPassword].some((field)=> !field || field?.trim()==="")
  ){
    return res
    .status(400)
    .json({success:false, message: "All fields are required"})
  }


  const teacher = await Teacher.findById(req.teacher._id)
    const isPasswordCorrect = await teacher.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
      return res
      .status(420)
      .json({success:false,message:"Old Password Mismatch"})
    }

    teacher.password = newPassword
    await teacher.save({validateBeforeSave: false})

    return res
    .status(200)
    .json({success:true,message:"Password changed successfully"})


}


export {
    registerteacher,
    loginteacher,
    logoutteacher,
    getlogininfo,
    getClassesandSubjects,
    updateteacher,
    changePassword
}