import { Router } from "express";
import {
  sendOtp,
  verifyOtp,
  registration,
  sendRegistrationOtp,
} from "./driver.auth.controller";

const authDriverRouter = Router();

authDriverRouter.post("/send-otp", sendOtp);
authDriverRouter.post("/verify-otp", verifyOtp);
authDriverRouter.post("/registeration-otp", sendRegistrationOtp);
authDriverRouter.post("/registeration", registration);

export default authDriverRouter;
