import type { NextFunction, Response } from "express";

export const extractReqInfo = (req: any, res: Response, next: NextFunction) => {
  const method = req.method;
  const url = req.url;
  const baseUrl = req.baseUrl;
  const originalUrl = req.originalUrl;
  //   const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

  console.log(`[${new Date().toISOString()}] ${method} ${originalUrl}`);
  next();
};
