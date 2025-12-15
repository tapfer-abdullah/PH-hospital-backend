import type { NextFunction, Request, Response } from "express";

const parseUploadedFormData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body.data) {
      const parsedData = JSON.parse(req.body.data);
      req.body.data = { ...parsedData };
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default parseUploadedFormData;
