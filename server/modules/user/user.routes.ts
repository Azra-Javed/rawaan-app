import { Router } from "express";
import { getUserInfo, registerUser } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const UserRouter = Router();

UserRouter.put("/register", authMiddleware, registerUser);
UserRouter.get("/me", authMiddleware, getUserInfo);

export default UserRouter;
