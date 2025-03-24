import mongoose, {Schema} from "mongoose";

const subjectSchema = new Schema({
    name: {
        required: true,
        type: String
    },
    code: {
        type: Number
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher'
    }
})

export const Subject = mongoose.model("Subject",subjectSchema)