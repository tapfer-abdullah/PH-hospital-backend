import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const apiNotFound = (req: Request, res: Response, next: NextFunction) => {
  const originalUrl = req.originalUrl;
  const ipAddress = req.ip;
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "API Not Found",
    data: {
      method: req.method,
      path: originalUrl,
      ip: ipAddress,
      error: "The requested API endpoint does not exist.",
    },
  });
};

export default apiNotFound;
