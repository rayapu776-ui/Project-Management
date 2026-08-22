import { Router } from "express";
import {addMembersToProject,
    CreateProject,
    deleteMember,
    getProjects,
    getProjectById,
    getProjectMembers,
    updateMemberRole,
    updateProject,
    deleteProject} from "../controllers/project.controllers.js"
import { validate } from "../middlewares/validator.middleware.js";
import {createProjectValidatator,addMembertoProjectValidator} from "../validators/index.js";
import {verifyJwt, validateProjectPermission} from "../middlewares/auth.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constance.js";

const router = Router ();

router.use(verifyJwt)

router
    .route("/")
    .get(getProjects)
    .post(createProjectValidatator(),validate,CreateProject)

router
    .route("/:projectId")
    .get(validateProjectPermission(AvailableUserRole),getProjectById)
    .put(validateProjectPermission([UserRolesEnum.ADMIN]),updateProject,createProjectValidatator(),validate)
    .delete(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        deleteProject
    )

router
    .route("/:projectId/members/:userId")
    .get(getProjectMembers)
    .post(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        addMembertoProjectValidator(),
        validate,
        addMembersToProject
    )

router
    .route("/:projectId/members/:userId")
    .put(validateProjectPermission([UserRolesEnum.ADMIN]),updateMemberRole)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]),deleteMember)


export default router;