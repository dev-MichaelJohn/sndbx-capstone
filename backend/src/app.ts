import { createServer } from "http";
import { createApp } from "@/utils/create-app.util.js";
import env from "@/configs/env.config.js";
import { errorHandler } from "@/middlewares/error.middleware.js";
import { loggerMiddleware } from "@/middlewares/logger.middleware.js";
import v1Router from "@/routers/index.router.js";
import { logger } from "./utils/logger.util.js";
import { seederFunction } from "./utils/seeder.util.js";
import { initSocket } from "./utils/socket.util.js";

const app = createApp();

app.use(loggerMiddleware);
app.use("/api/v1", v1Router);
app.use(errorHandler);

const httpServer = createServer(app);
initSocket(httpServer);

export const startApp = () => {
  httpServer.listen(env.PORT, async () => {
    await seederFunction();
    logger.info(`🚀 Server online with Socket.io @ http://localhost:${env.PORT}`);
  });
};
