import express, { type Express } from "express";


export const createApp = (): Express => {
  const app = express();

  app.use(express.json());

  return app;
};
