import mongoose, { Schema } from "mongoose";

const attendSchema = new Schema({
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'Student'
    }],
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