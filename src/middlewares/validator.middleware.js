import { validationResult } from "express-validator.js";
import { ApiError } from "../utils/api-error.js"



export const validate = (req , res , next) => {
    const error = validationResult(res)
    if(error.isEmpty()){
        return next();
    }
    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push(
        {
            [err.path]: err.msg
        }));

    throw new ApiError(422, "Recived data is not valid", extractedErrors)
}