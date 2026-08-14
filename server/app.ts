import "dotenv/config";

import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/auth.routes";
import UserRouter from "./modules/user/user.routes";

export const app = express();

//body parser
app.use(express.json({ limit: "50mb" }));

//cookie parser
app.use(cookieParser());

//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", UserRouter);

//testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

app.use((req, res) => {
  console.log("404:", req.method, req.originalUrl);

  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});
