import { Request, Response } from "express";
import prisma from "../../utils/prisma";

//@desc: update driver status
//@route: PUT /api/v1/driver/update-status
export const UpdateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!req.driver?.driverId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const driver = await prisma.driver.update({
      where: {
        id: req.driver.driverId,
      },
      data: {
        status,
      },
    });

    return res.status(200).json({
      success: true,
      driver,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
