import express, { type Express } from "express";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import "@/configs/passport.config.js";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

/**
 * Builds and configures the Express app instance: JSON body parsing,
 * Passport initialization (strategies registered via the side-effect
 * import of `passport.config.js`), cookie parsing, CORS for the
 * frontend's local dev origin (with PDF content-type exposed), and a
 * global rate limiter.
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
      exposedHeaders: ["x-access-token", "Content-Disposition"],
    }),
  );
  app.use(limiter);

  return app;
};
