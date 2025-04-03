import { Teacher } from "../models/teachers.model.js";
import pkg from "jsonwebtoken";

export const verifyJWT = async(req,res,next) => {
    try {

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if (!token) {
            return res
            .status(401)
            .json({success:false, message: "You are not Logged In"})
        }
    
        const decodedToken = pkg.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const teacher = await Teacher.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!teacher){
            return res
            .status(420)
            .json({success:false, message: "Invalid Access Token"})
        }
    
        req.teacher = teacher;
        next()

    } catch (error) {
        return res
        .status(420)
        .json({success:false, message: "Invalid Access Token"})
    }

}