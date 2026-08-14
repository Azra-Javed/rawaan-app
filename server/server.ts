import "dotenv/config";
import { connectRedis } from "./lib/redis";
import { app } from "./app";

const startServer = async () => {
  try {
    await connectRedis();

    app.listen(process.env.PORT, () => {
      console.log(`Server is connected with port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect Redis:", error);
    process.exit(1);
  }
};

startServer();
