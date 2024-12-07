import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    rollno: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        index:true
    }
})

export const Student = mongoose.model("Student", studentSchema);