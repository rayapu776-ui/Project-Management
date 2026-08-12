import { Router } from "express";
import {login, registerUser} from "../controllers/auth.controller.js"
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator } from "../validators/index.js";


const raouter = Router ();

router.route("/register").post(userRegisterValidator(),validate,registerUser)
router.route("/login").post(userLogginValidator(),validate,login)

export default raouter;