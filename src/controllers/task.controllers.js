import {User} from "../models/user.model.js"
import {Project} from "../models/project.models.js"
import {Task} from "../models/task.models.js"
import {Subtask} from "../models/subtask.models.js"
import {ApiResponse} from "../utils/async-handler.js"
import {ApiError} from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import mongoose from "mongoose"
import { AvailableUserRole, UserRolesEnum } from "../utils/constance.js"


const getTask = async(async(req,res)=>{
    const {projectId} = req.params;
    const project = await Project.findById(projectId)
    
    if(!project){
        throw new ApiError(404, "Project not found")
    }

    await Task.find({
        project : new mongoose.Types.ObjectId(projectId)
    }).populate("assignedTo", "avatar username fullName")

    return res
         status(201)
         .json(
            new ApiResponse(201,
                "Task fetched successfully"
            )
         )



})

const createTask = async(async(req,res)=>{
    const {title,description,assignedTo,status} = req.body
    const {projectId} = req.params;
    const project = await Project.findById(projectId)

    if(!project){
        throw new ApiError(404, "Project not found")
    }

   const files =  req.files || []

   const attachments = files.map((file) => {
    return {
        url : `${process.env.SERVER_URL}/images/${file.originalname}`,
        mimetype : file.mimetype,
        size: file.size
    }
   })

   const task = await Task.create({
    title,
    description,
    project : new mongoose.Types.ObjectId(projectId),
    assignedTo : assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined,
    status,
    assignedBy : new mongoose.Types.ObjectId(req.user._id),
    attachments
   })

   return res
         status(201)
         .json(
            new ApiResponse(201,
                "Task createdd successfully"
            )
         )


})

const getTaskById = async(async(req,res)=>{
    const {taskId} = req.params
    const task = await Task.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "assignedTO",
                foreignField: "_id",
                as : "assignedTo",
                pipeline : [
                    {
                        _id : 1,
                        username : 1,
                        fullName : 1,
                        avatar : 1
                    }
            ]
            }
        },
        {
            $lookup : {
                from : "subtasks",
                localField : "_id",
                foreignField: "task",
                as : "subtasks",
                pipeline : [
                    {
                        $lookup:
                        {
                        from : "users",
                        localField : "createdBy",
                        foreignField: "_id",
                         as : "createdBy",
                         pipeline:[
                            {
                                $project : {
                                    _id : 1,
                                    username : 1,
                                    fullName : 1,
                                    avatar : 1
                                }
                            }
                         ]
                        }
                    },
                    {
                        $addFields : {
                            createdBy : {
                                $arrayElemAt : ["$createdBy"]
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields : {
                assignedTo : {
                    $arrayElemAt: ["$assignTo"]
                }
            }
        }
    ])

    if(!task || task.length === 0){
        throw new ApiError(404, "Task not found")
    }
    return res.status(200).json(new ApiResponse(200 , "Tasked fetched successfully"))
})

const updateTask = async(async(req,res)=>{
    //task
})

const deleteTask = async(async(req,res)=>{
    //task
})

const createSubTask = async(async(req,res)=>{
    //task
})

const updateSubTask = async(async(req,res)=>{
    //task
})

const deleteSubTask = async(async(req,res)=>{
    //task
})



export {
    getTask,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask
}