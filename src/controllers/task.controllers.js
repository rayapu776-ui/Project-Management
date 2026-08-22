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
    //task
})

const createTask = async(async(req,res)=>{
    //task
})

const getTaskById = async(async(req,res)=>{
    //task
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