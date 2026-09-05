import express, { NextFunction, Request, Response } from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import geolib from "geolib";

const app = express();

const server = createServer(app);

const wss = new WebSocketServer({
  server,
});

const drivers: Record<
  string,
  { latitude: number; longitude: number }
> = {};

wss.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());

      // Driver location
      if (
        data.type === "locationUpdate" &&
        data.role === "driver"
      ) {
        drivers[data.driverId] = {
          latitude: data.data.latitude,
          longitude: data.data.longitude,
        };

        console.log(
          "Driver location updated:",
          drivers[data.driverId]
        );
      }

      // User requests nearby drivers
      if (
        data.type === "requestRide" &&
        data.role === "user"
      ) {
        const nearbyDrivers = findNearbyDrivers(
          data.latitude,
          data.longitude
        );

        console.log(
          "Nearby drivers:",
          nearbyDrivers
        );

        socket.send(
          JSON.stringify({
            type: "nearbyDrivers",
            drivers: nearbyDrivers,
          })
        );
      }

      // Driver updates ride status
      if (
        data.type === "rideStatusUpdate"
      ) {
        console.log(
          "Ride status update:",
          data
        );

        // Send to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(
              JSON.stringify({
                type: "rideStatusUpdated",
                rideId: data.rideId,
                status: data.status,
              })
            );
          }
        });
      }
    } catch (error) {
      console.log(
        "Invalid message:",
        error
      );
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

const findNearbyDrivers = (
  userLat: number,
  userLong: number
) => {
  return Object.entries(drivers)
    .filter(([_, location]) => {
      const distance =
        geolib.getDistance(
          {
            latitude: userLat,
            longitude: userLong,
          },
          location
        );

      return distance <= 5000;
    })
    .map(([id, location]) => ({
      id,
      ...location,
    }));
};

const PORT = process.env.PORT
  ? parseInt(process.env.PORT)
  : 8080;

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});

//testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});