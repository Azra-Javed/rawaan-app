import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import redis from "../../lib/redis";
import { sendOtpEmail } from "../../services/email.service";
import { deleteOtp, generateOtp, getOtp, saveOtp } from "../../utils/otp";
import prisma from "../../utils/prisma";

const JWT_SECRET = process.env.JWT_SECRET as string;

//@desc: send-otp
//@route: POST /api/v1/auth/send-otp
export async function sendOtp(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const key = `otp:${email}`;
    const existingOtp = await redis.get(key);

    if (existingOtp) {
      return res.status(200).json({
        success: true,
        message: "OTP already sent, please check your email",
      });
    }

    const otp = generateOtp();
    await saveOtp(email, otp);
    await sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
}

//@desc: verify otp and create/login user, then issue a JWT session token
//@route: POST /api/v1/auth/verify-otp
export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const storedOtp = await getOtp(email);

    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or does not exist",
      });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP is valid -> delete it (one-time use)
    await deleteOtp(email);

    // Check user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Existing user, or create a new one
    const user =
      existingUser ??
      (await prisma.user.create({
        data: { email },
      }));

    // Issue JWT session token now that identity is verified
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // check user profile is complete or not
    const isNewUser = !existingUser || !user.name;

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      isNewUser,
      user,
      token,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
}
