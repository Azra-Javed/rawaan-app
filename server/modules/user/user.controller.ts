import { Request, Response } from "express";
import prisma from "../../utils/prisma";

// @desc   Complete user registration
// @route  PUT /api/v1/user/register

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, name, phone_number } = req.body;
    console.log(req.body);

    // 1. Validate required fields
    if (!email || !name || !phone_number) {
      return res.status(400).json({
        success: false,
        message: "Email, name and phone number are required",
      });
    }

    // 2. Find the user
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // 3. User doesn't exist
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please verify your email first.",
      });
    }

    // 4. Update user
    const updatedUser = await prisma.user.update({
      where: {
        email,
      },
      data: {
        name,
        phone_number,
      },
    });

    // 5. Return updated user
    return res.status(200).json({
      success: true,
      message: "Account registered successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Register user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

// @desc   get user info
// @route  PUT /api/v1/user/me
export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

//@desc: update user's push notification token
//@route: PUT /api/v1/user/update-push-token
export const updateUserPushToken = async (req: Request, res: Response) => {
  try {
    const { pushToken } = req.body;

    if (!pushToken || !req.user) {
      return res
        .status(400)
        .json({ success: false, message: "Missing push token or user" });
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { pushToken },
    });


    return res.status(200).json({ success: true, user });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc: getting user's all rides
//@route: PUT /api/v1/user/get-rides
export const getAllRides = async (req: any, res: Response) => {
  try {
    const rides = await prisma.rides.findMany({
      where: {
        userId: req.user?.id,
      },
      include: {
        driver: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      rides,
    });
  } catch (error) {
    console.log("Get all rides error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get user rides",
    });
  }
};

// @desc: create issue
//@route: PUT /api/v1/user/report-issue
export const reportIssue = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }

    // For now, just log it — you could later save to a Report/SupportTicket model
    console.log("Issue reported by user:", req.user?.userId, message);

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
