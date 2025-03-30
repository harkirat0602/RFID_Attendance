import mongoose, { Schema } from "mongoose";

const studentSchema = new Schema({
    rollno: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    firstname: {
        type: String,
        required: true,
        index:true
    },
    lastname: {
        type: String,
        required: true,
        index:true
    },
    dob: {
        type: Date,
        required : true
    },
    class: {
        type: Schema.Types.ObjectId,
        ref: "Class",
        required: true
    }
});

export const Student = mongoose.model("Student", studentSchema);