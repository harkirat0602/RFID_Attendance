import { Teacher } from "../models/teachers.model.js";



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




export {
    registerteacher,
    loginteacher,
    logoutteacher,
    getlogininfo
}