import express, { type Express } from "express";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import "@/configs/passport.config.js";
import env from "@/configs/env.config.js";

/**
 * Builds and configures the Express application with response compression,
 * JSON body parsing, CORS headers, cookie handling, and Passport auth strategies.
 */
export const createApp = (): Express => {
  const app = express();

  // Enable Gzip/Brotli response compression (~70% payload size reduction)
  app.use(compression());

  app.use(express.json());
  app.use(passport.initialize());
  app.use(cookieParser());
  app.use(
    cors({
      origin: env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
      exposedHeaders: ["x-access-token", "Content-Disposition"],
    }),
  );

  return app;
};
