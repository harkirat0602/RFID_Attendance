import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const teacherSchema = new Schema({
    username: {
        type: String,
        required: [true,"Username is required"],
        unique: true,
        index: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
    },
    dob: {
        type: Date
    },
    password: {
        type: String,
        required: [true,"Password is Required"]
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String
    }
})

teacherSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,15);
    }
    next();
})


teacherSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}


teacherSchema.methods.generateAccessToken = async function(){
    return await jwt.sign({
        _id: this._id,
        username: this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}



teacherSchema.methods.generateRefreshToken = async function(){
    return await jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}



export const Teacher = mongoose.model("Teacher",teacherSchema);