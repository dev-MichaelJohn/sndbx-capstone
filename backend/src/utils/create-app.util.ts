import express, { type Express } from "express";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";
import "@/configs/passport.config.js";

/**
 * Builds and configures the Express app instance: JSON body parsing,
 * Passport initialization (strategies registered via the side-effect
 * import of `passport.config.js`), cookie parsing, and CORS for the
 * frontend's local dev origin.
 *
 * @returns a configured but not-yet-listening Express app
 */
export const createApp = (): Express => {
  const app = express();

  app.use(express.json());
  app.use(passport.initialize());
  app.use(cookieParser());
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
      exposedHeaders: ["x-access-token"],
    }),
  );

  return app;
};
