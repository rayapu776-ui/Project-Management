import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/async-handler.js"
import {ApiError} from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import {forgotPasswordMailgenContent, sendEmail} from "../utils/mail.js"
import jwt from "jsonwebtoken"



const generateAccessAndRefreshTokens = async = (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshtoken = user.generateRefreshToken()

        user.refreshToken = refreshtoken
        await user.save({validateBeforeSave : false})
        return {accessToken, refreshtoken}
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access"
        )
    }
}


const registerUser = asyncHandler(async (req , res) => {
   const {email , username , password , role } = req.body

  const existedUser = User.findOne({
    $or : [{username}, {email}]
   })

   if (existedUser){
    throw new ApiError(409, "User with email or username already exists", [  ])

   }

   const user = await User.create ({
    email ,
    password,
    username,
    isEmailVerified : false
   })
   const { unHashedToken , hashedToken , tokenExpiry} =
   user.generateTemporaryToken()

   user.emailVerificationToken = hashedToken
   user.emailVerificationExpiry = tokenExpiry

   await user.save({validateBeforeSave: false})

   await sendEmail({
    email : user?.email,
    subject : "Please verify your email",
    mailgenContent : emailverificationMailgenContent(
        user.username,
        `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    ),
   })

   const createdUser =await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationTokrn -emailVerificationExpiry",
   );

   if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering a user")
   }

   return res 
   .status(201)
   .json(
    new ApiResponse(
        200,
        {user: createdUser},
        "User registered ssuccesfully and verification email has been sent on your email"
    )
   )
})

const login = asyncHandler(async (req , res)=> {
    const {email , password, username} =req.body
    if(!email){
        throw new ApiError(400, " email is required")
    }

    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(400, "User does not exists")
    }

    const isPasswordValid = user.isPasswordCorrect(password);
    if(!password){
        throw new ApiError(400, "Invalid credentials")
    }

   const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id)
   
   
   const loggedInUser =await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationTokrn -emailVerificationExpiry",
   );

   const option = {
    httpOnly : true,
    secure : true
   }
   return res
   .status(200)
   .cookie("accesToken",accessToken,option)
   .cookie("refreshToken",refreshToken, option)
   .json(
    new ApiResponse(
        200,
        {
            user : loggedInUser,
            accessToken,
            refreshToken
        },
        "User logged in successfully"
    )
   )


})


const logoutUser = asyncHandler (async (req , res ) => {
    await User.findByIdAndDelete(req.user._id,
        {
            $set : {
                refreshToken:""
            }
        },
        {
            new : true
        }
    )
    const options = {
        httpOnly : true ,
        secure : true
    }
    return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(
            (new ApiResponse(200, {} , "User logged out"))
        )
})


const getCurrentUser = asyncHandler (async (req , res)=> {
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "Current user fetched successfully"
        )
    )
})

const verifyEmail = asyncHandler (async (req , res)=> {
    const {verificationToken} = req.params

    if(!verificationToken){
        throw new ApiError(400, "Email verification token is missing")
    }

    let hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")

        const user = await User.findOne({
            emailVarficationExpiry : hashedToken,
            emailVarficationExpiry : {$gt : Date.now()}
        })
        if(!user){
            throw new ApiError(400 , "Token is invalied or expired" )
        }

        user.emailVarficationToken = undefined
        user.emailVarficationExpiry = undefined

        user.isEmailVerified = true 
        await user.save({validateBeforeSave: false})

        return res 
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isEmailVerified :true
                },
                "Email is verified"
            )
        )
})


const resentEmailVerification = asyncHandler (async (req , res)=> {
   const user = await User.findById(req.User?._id)

   if(!user){
    throw new ApiError("404", "User does not exist")
   }
   if(user.isEmailVerified){
    throw new ApiError(404,"Email is already verified")
   }

   await user.save({validateBeforeSave: false})

   await sendEmail({
    email : user?.email,
    subject : "Please verify your email",
    mailgenContent : emailverificationMailgenContent(
        user.username,
        `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    ),
   })

   return res
   .status(200)
   .json(
    new ApiResponse(
        200,
        {},
        "Mail has been sent to your email Id"
    )
   )
})



const refreahAccessToken = asyncHandler (async (req , res)=> {
   const incommingRefreshToken = req.cookie.refreshToken ||  req.body.refreshToken

   if(!incommingRefreshToken){
    throw new ApiError(401,"Unaouthorized access")
   }

   try {
    const decodedToken = jwt.verify(incommingRefreshToken , process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if(!user){
    throw new ApiError(401,"Invalid refreshToken")
   }

   if(incommingRefreshToken !== user?.refreshToken){
    throw new ApiError(401,"Refresh token is expired")
   }

   const options = {
    httpOnly : true ,
    secure : true
   }

   const {accessToken, refreshtoken: newRefreshToken} =await 
   generateAccessAndRefreshTokens(user._id)

   user.refreshToken = newRefreshToken;
   await user.save()


   return res
   .ststus(200)
   .cookie("accessToken ", accessToken, options)
   .cookie("refreshToken",newRefreshToken,options)
   .json(
    new ApiResponse(
        200,
        {accessToken,refreshToken: newRefreshToken},
        "Access token refreshed"
    )
   )
   } catch (error) {
    throw new ApiError(401,"Invalied refresh token")
   }
})

const forgotPassowrdRequest = asyncHandler (async (req , res)=> {
    const {email} = req.body

    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(400, "User does not exitst")
    }

    const {unHashedToken,hashedToken,tokenExpiry} = 
    user.generateTemporaryToken();

    user.forgotPasswordToken = hashedToken
    user.forgetPasswordExpiry = tokenExpiry

    await user.save ({validateBeforeSave: false})

    await sendEmail({
         
    email : user?.email,
    subject : "Password rest request",
    mailgenContent : forgotPasswordMailgenContent(
        user.username,
        `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
    ),
   })


   returnres
   .status(200)
   .json(
    new ApiResponse(
        200,
        {},
        "Password reset mail has been sent on your mail id"
    )
   )
})


const resetForgotPassword = asyncHandler (async (req , res)=> {
   const {refreshToken} = req.params
   const {newPassword} =  req.body

   let hashedToken = crypto
   .createHash("sha256")
   .update(restToken)
   .digest("hex")

   await User.findOne({
    forgotPasswordToken : hashedToken,
    forgetPasswordExpiry : {$gt: Date.now()}
   })

   if(!user){
    throw new ApiError(489, "Token is invalied or expired")
   }

   user.forgetPasswordExpiry = undefined
   user.forgotPasswordToken = undefined

   user.password = newPassword
   await user.save({validateBeforeSave : false})

   return res
   .status(200)
   .json(
    new ApiResponse(
        200,
        {},
        "Password rest successfully"
    )
   )
})


const changeCurrentPassword = asyncHandler (async (req , res)=> {
    const {oldPassword , newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new ApiError(404,"Invalid old Password")
    }

    user.password = newPassword
    await user.save({validdateBeforeSave: false});

    return res
    .status(200)
    .json(new ApiResponse(200 , {}, "Password change successfully"))
})

export {registerUser ,
     login , 
     logoutUser, 
     getCurrentUser , 
     verifyEmail,
     resentEmailVerification,
     refreahAccessToken,
     forgotPassowrdRequest,
     changeCurrentPassword,
     resetForgotPassword,
     
}