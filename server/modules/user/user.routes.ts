import { Router } from "express";
import {
  getAllRides,
  getUserInfo,
  registerUser,
  reportIssue,
  updateUserPushToken,
} from "./user.controller";
import { userAuthMiddleware } from "../../middleware/auth.middleware";

const UserRouter = Router();

UserRouter.put("/register", userAuthMiddleware, registerUser);
UserRouter.get("/me", userAuthMiddleware, getUserInfo);
UserRouter.put("/update-push-token", userAuthMiddleware, updateUserPushToken);
UserRouter.get("/get-rides", userAuthMiddleware, getAllRides);
UserRouter.post("/report-issue", userAuthMiddleware, reportIssue);
export default UserRouter;
