import { Router } from "express";
import {
  getUserInfo,
  registerUser,
  updateUserPushToken,
} from "./user.controller";
import { userAuthMiddleware } from "../../middleware/auth.middleware";

const UserRouter = Router();

UserRouter.put("/register", userAuthMiddleware, registerUser);
UserRouter.get("/me", userAuthMiddleware, getUserInfo);
UserRouter.put("/update-push-token", userAuthMiddleware, updateUserPushToken);

export default UserRouter;
