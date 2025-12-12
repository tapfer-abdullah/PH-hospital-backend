import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Global Error Handler:", err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default globalErrorHandler;
