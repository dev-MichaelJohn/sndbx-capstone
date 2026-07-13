import { createApp } from "@/utils/create-app.util.js";
import env from "@/configs/env.config.js";
import { errorHandler } from "@/middlewares/error.middleware.js";
import { loggerMiddleware } from "@/middlewares/logger.middleware.js";

const app = createApp();

app.use(loggerMiddleware);

app.use(errorHandler);

export const startApp = () => {
  app.listen(env.PORT, () => {
    console.log(`🚀 Server is online @ http://localhost:${env.PORT}`);
  });
};
