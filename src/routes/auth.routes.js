import { Router } from "express";
import {changeCurrentPassword, forgotPassowrdRequest, getCurrentUser, login, logoutUser, refreahAccessToken, registerUser, resentEmailVerification, resetForgotPassword, verifyEmail} from "../controllers/auth.controller.js"
import { validate } from "../middlewares/validator.middleware.js";
import {userChangeCurrentPasswordValidator,userForgotPasswordValidator,userLogginValidator, userRegisterValidator,userRestForgotPasswordValidator } from "../validators/index.js";
import {verifyJwt} from "../middlewares/auth.middleware.js";

const router = Router ();

//unsecured route
router.route("/register").post(userRegisterValidator(),validate,registerUser)
router.route("/login").post(userLogginValidator(),validate,login)
router.route("/varify-email/:verificationToken").get(verifyEmail)
router.route("/refresh-token").post(refreahAccessToken)
router.route("/forgot-password").post(userForgotPasswordValidator(),  forgotPassowrdRequest)
router.route("./reset-password/:resetToken").post(userResetForgotPasswrodvalidator(),validate,resetForgotPassword)


//secure routes
router.route("/logout").post(verifyJwt,logoutUser)
router.route("/current-user").post(verifyJwt,getCurrentUser) 
router.route("/change-paasword").post(verifyJwt,userChangeCurrentPasswordValidator(),validate,changeCurrentPassword)
router.route("/resent-email-verification").post(verifyJWT,resentEmailVerification)
export default router;