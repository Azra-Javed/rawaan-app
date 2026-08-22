import { Router } from "express";
import {
  getDriversById,
  updatePushToken,
  UpdateStatus,
} from "./driver.controller";
import { driverAuthMiddleware } from "../../middleware/auth.middleware";

const driverRouter = Router();

driverRouter.put("/update-status", driverAuthMiddleware, UpdateStatus);
driverRouter.get("/get-drivers-data", getDriversById);

driverRouter.put("/update-push-token", driverAuthMiddleware, updatePushToken);

export default driverRouter;
