import type { Response } from "express";

export const sendResponse = <T>(
  res: Response,
  payload: {
    code: number;
    success: boolean;
    message: string;
    data: T | null | undefined;
    pagination?: {
      currentPage: number;
      totalDocuments: number;
      limit: number;
    };
  },
  otherFields?: any
) => {
  const { code, success, message, data, pagination } = payload;

  return res.status(code).json({
    success,
    message,
    pagination,
    data,
    ...otherFields,
  });
};
