import mongoose, { Schema } from "mongoose";

const classSchema = new mongoose.Schema({
    class_name: {
        type : String,
        required: true,
        unique: true,
        index: true
    },
    year: Number,
    subjects: [
        {
            type: Schema.Types.ObjectId,
            ref:'Subject'
        }
    ]
});

export const Class = mongoose.model("Class",classSchema);