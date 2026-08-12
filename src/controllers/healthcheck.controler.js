import { ApiResponse } from "../utils/api-responce.js";
import { asyncHandler } from "../utils/async-handler.js";
/**
 * 
 * @param {*} res 
 * @param {*} req 
 * @param {*} next 

const healthCheck = (res , req , next) => {
    try {
        const user = await  getUserFromDB()
        res.status(200).json(
            new ApiResponse(200, {message :" Servar is runnig"})
        )
    } catch (error) {
       next(err)  
    }
}
*/



const healthCheck = asyncHandler (async(req ,res) => {
    res.status(200).json(
        new ApiResponse(200 , {message: "Server is still   running"})
    )
})




export {healthCheck};