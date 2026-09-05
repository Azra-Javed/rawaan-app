import { Router } from "express";
import {
  getAllRides,
  getDriverInfo,
  getDriversById,
  newRide,
  rateDriver,
  rejectRide,
  updatePushToken,
  UpdateStatus,
  updatingRideStatus,
} from "./driver.controller";
import { driverAuthMiddleware } from "../../middleware/auth.middleware";

const driverRouter = Router();

driverRouter.put("/update-status", driverAuthMiddleware, UpdateStatus);
driverRouter.get("/get-drivers-data", getDriversById);

driverRouter.put("/update-push-token", driverAuthMiddleware, updatePushToken);
driverRouter.post("/new-ride", driverAuthMiddleware, newRide);
driverRouter.put(
  "/update-ride-status",
  driverAuthMiddleware,

  updatingRideStatus,
);
driverRouter.get("/get-rides", driverAuthMiddleware, getAllRides);
export default driverRouter;
driverRouter.get("/me", driverAuthMiddleware, getDriverInfo);
driverRouter.post("/reject-ride", driverAuthMiddleware, rejectRide);
driverRouter.put(
  "/rating", driverAuthMiddleware,
  rateDriver
);

