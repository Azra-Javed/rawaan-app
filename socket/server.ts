import express from "express";
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

      if (data.type === "locationUpdate" && data.role === "driver") {
        drivers[data.driverId] = {
          latitude: data.data.latitude,
          longitude: data.data.longitude,
        };

        console.log("Driver location updated:", drivers[data.driverId]);
      }

      if (data.type === "requestRide" && data.role === "user") {
        const nearbyDrivers = findNearbyDrivers(
          data.latitude,
          data.longitude
        );

        console.log("Nearby drivers:", nearbyDrivers);

        socket.send(
          JSON.stringify({
            type: "nearbyDrivers",
            drivers: nearbyDrivers,
          })
        );
      }
    } catch (error) {
      console.log("Invalid message:", error);
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
      const distance = geolib.getDistance(
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
  : 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});