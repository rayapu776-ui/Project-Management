import { User } from "../models/user.model";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler(async(req,res,next)=>{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")

    if(!token){
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationTokrn -emailVerificationExpiry")

         if(!user){
        throw new ApiError(401, "Invalid access token")
    }
    req.User = user
    next()

    } catch (error) {
        throw new ApiError(401, "Invalid access token")
    }
})