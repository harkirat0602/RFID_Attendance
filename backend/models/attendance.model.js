import mongoose, { Schema } from "mongoose";

const attendSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    subject: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    date: {
        type: Date,
        required : true
    }
})

export const Attendance = mongoose.model("Attendance",attendSchema)