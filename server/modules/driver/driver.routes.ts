import { Router } from "express";
import { UpdateStatus } from "./driver.controller";
import { driverAuthMiddleware } from "../../middleware/auth.middleware";

const driverRouter = Router();

driverRouter.put("/update-status", driverAuthMiddleware, UpdateStatus);

export default driverRouter;
