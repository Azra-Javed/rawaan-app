import express from "express";
import { WebSocketServer } from "ws";
import geolib from "geolib";

const app = express();

const wss = new WebSocketServer({
  port: 8080,
});

const drivers: Record<string, { latitude: number; longitude: number }> = {};

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
        const nearbyDrivers = findNearbyDrivers(data.latitude, data.longitude);

        console.log("Nearby drivers:", nearbyDrivers);

        socket.send(
          JSON.stringify({
            type: "nearbyDrivers",
            drivers: nearbyDrivers,
          }),
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

const findNearbyDrivers = (userLat: number, userLong: number) => {
  return Object.entries(drivers)
    .filter(([_, location]) => {
      const distance = geolib.getDistance(
        {
          latitude: userLat,
          longitude: userLong,
        },
        location,
      );

      return distance <= 5000;
    })
    .map(([id, location]) => ({
      id,
      ...location,
    }));
};

app.listen(4000, () => {
  console.log("Express server running on port 4000");
});
