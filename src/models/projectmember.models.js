import mongoose, {Schema} from "mongoose";
import {AvailableUserRole, UserRolesEnum} from "../utils/constance.js"


const projectMemberSchema = new Schema ({
    User : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    Project : {
        type : Schema.Types.ObjectId,
        ref : "Project",
        required : true
    },
    role : {
        type : String,
        enum : AvailableUserRole,
        defualt : UserRolesEnum.MEMBER,
    }

},{timestamps: true}) 

export const ProjectMember = mongoose.model("ProjectMember",projectMemberSchema)