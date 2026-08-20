import { Router } from "express";
import { getUserInfo, registerUser } from "./user.controller";
import { userAuthMiddleware } from "../../middleware/auth.middleware";

const UserRouter = Router();

UserRouter.put("/register", userAuthMiddleware, registerUser);
UserRouter.get("/me", userAuthMiddleware, getUserInfo);

export default UserRouter;
