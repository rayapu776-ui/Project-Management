import mongoose, {Schema} from "mongoose";
import {AvailableTaskStatus,TaskStatusEnum} from "../utils/constance.js"


const taskSchema = new Schema ({
    title: {
        type: String,
        required : true,
        trim : true,
    },
    description: String,
    project:{
        type : Schema.Types.ObjectId,
        ref : "Project",
        required : true
    },
    assignedTo : {
        type : Schema.Types.ObjectId,
        ref : "AssignenTo"
    },
    assignedBy :{
        type : Schema.Types.ObjectId,
        ref : "AssignedBy"
    },
    Status : {
        type :String,
        enum : AvailableTaskStatus,
        default:TaskStatusEnum.TODO
    },
    attachments : {
        type : [{
            url : String,
            mimetype : String,
            size : Number,
        }],
        default : []
    }    
},{timestamps: true})

export const Task = mongoose.model("task",taskSchema)