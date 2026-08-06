import SystemLogService, { type ISystemLogService } from "@/services/system-log.service.js";
import { logEventEmitter, type LogEntry } from "@/utils/log-stream.util.js";
import { createAPIResponse } from "@/utils/response.util.js";
import type { NextFunction, Request, Response } from "express";

export class systemLogController {
  constructor(private logService: ISystemLogService = SystemLogService) {}

  async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.logService.getLogs(req.query as any);
      const response = createAPIResponse(200, "System logs retrieved successfully.", result);
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  streamLogs(req: Request, res: Response) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    res.write(
      `data: ${JSON.stringify({ type: "CONNECTED", message: "Live backend log stream active" })}\n\n`,
    );

    const onLog = (logData: LogEntry) => {
      res.write(`data: ${JSON.stringify(logData)}\n\n`);
    };

    logEventEmitter.on("log", onLog);

    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 15000);

    req.on("close", () => {
      clearInterval(heartbeat);
      logEventEmitter.removeListener("log", onLog);
      res.end();
    });
  }
}

const SystemLogController = new systemLogController();
export default SystemLogController;
