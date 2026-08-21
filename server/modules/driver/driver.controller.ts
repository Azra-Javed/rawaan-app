import { Request, Response } from "express";
import prisma from "../../utils/prisma";

//@desc: update driver status
//@route: PUT /api/v1/driver/update-status
export const UpdateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    console.log(status);

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

//@desc: get drivers by their IDs
//@route: GET /api/v1/driver/get-drivers-data

// Get drivers by their IDs
export const getDriversById = async (req: Request, res: Response) => {
  try {
    const { ids } = req.query;

    console.log(ids);
    console.log(req);

    // Check if IDs are provided
    if (!ids) {
      return res.status(400).json({
        message: "No driver IDs provided",
      });
    }

    // Convert "id1,id2,id3" into an array
    const driverIds = (ids as string).split(",");

    // Find drivers in database
    const drivers = await prisma.driver.findMany({
      where: {
        id: {
          in: driverIds,
        },
      },
    });

    return res.status(200).json(drivers);
  } catch (error) {
    console.error("Error fetching driver data:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
