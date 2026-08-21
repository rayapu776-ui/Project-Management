import { body } from "express-validator";


const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage ("Email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("username is required")
            .isLowercase()
            .withMessage("Username must be lower case")
            .isLength({min : 3})
            .withMessage("Username must be at least 3 charecters long"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required"),
        body("fullName")
            .optional()
            .trim() 
    ]
}

const userLogginValidator = () => {
    return [
        body("email")
            .optional
            .isEmail()
            .withMessage("Email is invalid"),
        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ]
}

const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword").notEmpty().withMessage("Old password is rquired"),
        body("newPassword").notEmpty().withMessage("New password is rquired"),
    ]
}

const userForgotPasswordValidator = () => {
    return [
        body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid")
    ]
}

const userRestForgotPasswordValidator =() => {
    return [
        body("newPassword")
        .notEmpty()
        .withMessage("Password is required")
    ]
}

export {
    userRegisterValidator,userLogginValidator
}