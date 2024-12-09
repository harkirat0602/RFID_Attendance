import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    class_name: {
        type : String,
        required: true,
        unique: true,
        index: true
    },
    year: Number
});

export const Class = mongoose.model("Class",classSchema);