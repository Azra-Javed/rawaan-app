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
    const user = req.user;

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};
