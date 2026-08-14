import { Router } from "express";
import { sendOtp, verifyOtp } from "./auth.controller";

const authRouter = Router();

authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);

export default authRouter;
