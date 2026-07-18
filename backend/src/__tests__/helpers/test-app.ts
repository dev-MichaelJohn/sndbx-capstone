import { createApp } from "@/utils/create-app.util.js";
import { errorHandler } from "@/middlewares/error.middleware.js";
import v1Router from "@/routers/index.router.js";
import type { Express } from "express";

export const createTestApp = (): Express => {
  const app = createApp();
  app.use("/api/v1", v1Router);
  app.use(errorHandler);
  return app;
};
