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
export const getDriversById = async (req: Request, res: Response) => {
  try {
    const { ids } = req.query;

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

//@desc: update driver's push notification token
//@route: PUT /api/v1/driver/update-push-token
export const updatePushToken = async (req: Request, res: Response) => {
  try {
    const { pushToken } = req.body;

    if (!pushToken) {
      return res.status(400).json({
        success: false,
        message: "Push token is required",
      });
    }

    if (!req.driver?.driverId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const driver = await prisma.driver.update({
      where: { id: req.driver.driverId },
      data: { pushToken },
    });

    return res.status(200).json({
      success: true,
      driver,
    });
  } catch (error: any) {
    console.error("Update push token error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc: create a new ride once a driver accepts a request
// @route: POST /api/v1/driver/new-ride
export const newRide = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      charge,
      status,
      currentLocationName,
      destinationLocationName,
      distance,
    } = req.body;

    if (!userId || charge === undefined) {
      return res.status(400).json({
        success: false,
        message: "userId and charge are required",
      });
    }

    if (!req.driver?.driverId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const newRide = await prisma.rides.create({
      data: {
        userId,
        driverId: req.driver.driverId,
        charge: parseFloat(charge),
        status: status || "Processing",
        currentLocationName,
        destinationLocationName,
        distance,
      },
    });

    return res.status(201).json({
      success: true,
      newRide,
    });
  } catch (error: any) {
    console.error("Create ride error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc: update ride status (Processing / Completed / Cancelled etc.)
// @route: PUT /api/v1/driver/update-ride-status
export const updatingRideStatus = async (req: Request, res: Response) => {
  try {
    const { rideId, rideStatus } = req.body;

    if (!rideId || !rideStatus) {
      return res.status(400).json({
        success: false,
        message: "rideId and rideStatus are required",
      });
    }

    const driverId = req.driver?.driverId;

    if (!driverId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const ride = await prisma.rides.findUnique({
      where: { id: rideId },
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    if (ride.driverId !== driverId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this ride",
      });
    }

    const updatedRide = await prisma.rides.update({
      where: { id: rideId },
      data: { status: rideStatus } as any,
    });

    if (rideStatus === "Completed") {
      await prisma.driver.update({
        where: { id: driverId },
        data: {
          totalEarning: { increment: ride.charge },
          totalRides: { increment: 1 },
        },
      });
    }

    return res.status(200).json({
      success: true,
      updatedRide,
    });
  } catch (error: any) {
    console.error("Update ride status error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc: get all rides for the currently logged-in driver
// @route: GET /api/v1/driver/get-rides
export const getAllRides = async (req: Request, res: Response) => {
  try {
    if (!req.driver?.driverId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const rides = await prisma.rides.findMany({
      where: { driverId: req.driver.driverId },
      include: {
        driver: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      rides,
    });
  } catch (error: any) {
    console.error("Get rides error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc   get driver info
// @route  PUT /api/v1/driver/me
export const getDriverInfo = async (req: Request, res: Response) => {
  try {
    const driverId = req.driver?.driverId;
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });
    
    res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    console.log(error);
  }
};


// @desc: reject a ride request
// @route: POST /api/v1/driver/reject-ride
export const rejectRide = async (req: Request, res: Response) => {
  try {
    const driverId = req.driver?.driverId;

    if (!driverId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Do NOT create a Ride here.
    // Only increase the driver's rejected/cancelled ride count.
    const driver = await prisma.driver.update({
      where: {
        id: driverId,
      },
      data: {
        cancelRides: {
          increment: 1,
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Ride request rejected successfully",
      driverId,
    });
  } catch (error: any) {
    console.error("Reject ride error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//@desc: update driver rating and ride rating
//@route: PUT /api/v1/driver/rating

export const rateDriver = async (req: Request, res: Response) => {
  try {
    
    const { rating, rideId} = req.body;

    const numericRating = Number(rating);
    const ride = await prisma.rides.findUnique({
      where: {
        id: rideId,
      },
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Ride must be completed
    if (ride.status.toLowerCase() !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You can only rate a completed ride",
      });
    }

   
    // Prevent duplicate rating
    if (ride.rating !== null) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this ride",
      });
    }


    const driver = await prisma.driver.findUnique({
      where: {
        id: ride.driverId,
      },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    
    // Calculate new driver rating
    
    const ratedRides = await prisma.rides.findMany({
      where: {
        driverId: ride.driverId,
        rating: {
          not: null,
        },
      },
      select: {
        rating: true,
      },
    });

    const oldRatingTotal = ratedRides.reduce(
      (total, currentRide) =>
        total + Number(currentRide.rating || 0),
      0
    );

    const oldRatingCount = ratedRides.length;

    const newRatingTotal = oldRatingTotal + numericRating;

    const newRatingCount = oldRatingCount + 1;

    const newDriverRating =
      newRatingTotal / newRatingCount;

    

    const updatedRide = await prisma.rides.update({
      where: {
        id: rideId,
      },
      data: {
        rating: numericRating,
      },
    });

    const updatedDriver = await prisma.driver.update({
      where: {
        id: ride.driverId,
      },
      data: {
        ratings: Number(newDriverRating.toFixed(2)),
      },
    });

    
    return res.status(200).json({
      success: true,
      message: "Driver rated successfully",
      data: {
        ride: updatedRide,
        driver: {
          id: updatedDriver.id,
          name: updatedDriver.name,
          ratings: updatedDriver.ratings,
        },
      },
    });
  } catch (error) {
    console.error("Rate driver error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit driver rating",
    });
  }
};