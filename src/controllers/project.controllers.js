import {User} from "../models/user.model.js"
import {Project} from "../models/project.models.js"
import {ProjectMember} from "../models/projectmember.models.js"
import {ApiResponse} from "../utils/async-handler.js"
import {ApiError} from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import mongoose from "mongoose"
import { AvailableUserRole, UserRolesEnum } from "../utils/constance.js"


const getProjects = asyncHandler(async(req,res)=>{
   const project = await ProjectMember.aggregate([
    {
        $match : {
            user : new mongoose.Types.ObjectId(req.user._id)
        },
    },
    {
        $lookup:{
            from : "projects",
            localField : "projects",
            foreignField : "_id",
            as : "projects",
            pipeline : [
                {
                    $lookup:{
                        from : "projectMembers",
                        localField : "_id",
                        foreignField : "projects",
                        as : "projectmembers"
                    }
                },
                {
                    $addFields : {
                        members : {
                            $size : "$projectmembers"
                        }
                    }
                }
            ]
        }
    },
    {
        $unwind : "$project"
    },
    {
        $project : {
            project : {
                _id : 1,
                name : 1,
                description :1,
                members : 1,
                createdAt : 1,
                createdBy : 1
            },
            role : 1,
            _id : 0
        }
    }
   ]
   )
   return res
   .status(200)
   .json(
    new ApiResponse(
        200,
        "Projects fatched succesfully"
    )
   )
})

const getProjectById = asyncHandler(async(req,res)=>{
    const {projectId}= req.params
    const project = await Project.findById(projectId)

    if(!project){
        throw new ApiError(404,"Project not found")
    }

    return res
    .status(201)
    .json(new ApiResponse(
        200,
        project,
        "Project fetched seccuessfully"
    ))
})

const CreateProject = asyncHandler(async(req,res)=>{
    const {name,description}= req.body

   const project = await Project.create({
    name,
    description,
    createdBy : new mongoose.Types.ObjectId(req.user._id)
   })

   await ProjectMember.create(
    {user : new mongoose.Types.ObjectId(req.user._id),
        project : new mongoose.Types.ObjectId(project._id),
        role : UserRolesEnum.ADMIN
    }
   )
   return res
           .status(201)
           .json(
            new ApiResponse(
                201,
                project,
                "Project created Successfully"
            )
           )
})

const updateProject = asyncHandler(async(req,res)=>{
    const {name,description} = req.body
    const {projectId} = req.params

    const project=  await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description
        },
       {new:true} 
    )

    if(!project){
        throw ApiError(404, "Project not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            project,
            "Project update succesfully"
        )
    )
});

const deleteProject = asyncHandler(async(req,res)=>{
    const {projectId} = req.params
    
    const project = await Project.findByIdAndDelete(projectId)
    if(!project){
        throw ApiError(404, "Project not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            project,
            "Project deleted succesfully"
        )
    )
})

const addMembersToProject = asyncHandler(async(req,res)=>{
    const {email, role}=req.body
    const {projectId} = req.params
    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404, "User does not exists")
    }
    await ProjectMember.findByIdAndUpdate(
        {
            user : new mongoose.Types.ObjectId(user._id),
            project : new mongoose.Types.ObjectId(projectId),
            role : role
        },
        {
            new : true,
            upsert : true
        }
    )

    return res
    .status(201)
    .json(
        new ApiResponse(
            201, 
            "project member added successfully"
        )
    )
})


const getProjectMembers = asyncHandler(async(req,res)=>{
   const {projectId} = req.params
   const project = await Project.findById(res.params)

   if(!project){
    throw new ApiError(404,"Project not found")
   }

   const projectMembers = await ProjectMember.aggregate([
    {
        $match : {
            project : new mongoose.Types.ObjectId(projectId)
        }
    },
    {
        $lookup:{
            from : "User",
            localField : "user",
            foreignField : "_id",
            as : "user",
            pipeline : [
                {
                    $project :{
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
            user : {
                $arrayElement : ["$user",0]
            }
        }
    },
    {
        $project :{
            project : 1,
            user : 1,
            role : 1,
            createAt : 1,
            updateAt : 1,
            _id : 0,
        }
    }

   ])
   return re 
   .status (200)
   .json(
    new ApiResponse(200,projectMembers,"Project members fetched")
   )
})

const updateMemberRole = asyncHandler(async(req,res)=>{
    const {projectId,userId} = req.params
    const {newRole} = req.body

    if(!AvailableUserRole.includes(newRole)){
        throw new ApiError(400,"Invalid Role")
    }

    let projectMember = await projectMember.findOne({
        project : new mongoose.Types.ObjectId(projectId),
        user : new mongoose.Types.ObjectId(userId)
    })
    if(!projectMember){
        throw new ApiError(400,"Project member not found")
    }

    projectMember = await ProjectMember.findByIdAndUpdate(
        projectMember._id,
        {
            role : newRole
        },
        {new : true}
    )
    if(!projectMember){
        throw new ApiError(400,"Project member not found")
    }
    return re 
   .status (200)
   .json(
    new ApiResponse(200,projectMember,"Project member role updated successfully")
   )
})


const deleteMember= asyncHandler(async(req,res)=>{
     const {projectId,userId} = req.params

    let projectMember = await projectMember.findOne({
        project : new mongoose.Types.ObjectId(projectId),
        user : new mongoose.Types.ObjectId(userId)
    })

    if(!projectMember){
        throw new ApiError(400,"Project member not found")
    }

    projectMember = await ProjectMember.findByIdAndDelete(
        projectMember._id,
    )
    if(!projectMember){
        throw new ApiError(400,"Project member not found")
    }
    return re 
   .status (200)
   .json(
    new ApiResponse(200,projectMember,"Project member deleted successfully")
   )
})


export {
    addMembersToProject,
    CreateProject,
    deleteMember,
    getProjects,
    getProjectById,
    getProjectMembers,
    updateMemberRole,
    updateProject,
    deleteProject
}