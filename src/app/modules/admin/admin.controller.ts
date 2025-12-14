import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as serviceFile from "./admin.service.ts";
import { sendResponse } from "../../utils/sendResponse.ts";
import catchAsync from "../../utils/catchAsync.ts";

const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Partial<T> => {
  const finalObj: Partial<T> = {};

  keys.forEach((key: K) => {
    if (
      obj &&
      Object.hasOwnProperty.call(obj, key) &&
      obj[key] !== undefined &&
      obj[key] !== null &&
      (obj[key] as string)?.trim() !== ""
    ) {
      finalObj[key] = obj[key];
    }
  });
  return finalObj;
};

export const createAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await serviceFile.createAdmin(req.body);
    return sendResponse(res, {
      code: StatusCodes.CREATED,
      message: "Admin created successfully",
      success: true,
      data: result,
    });
  }
);

export const getAdmins = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const searchQuery = pick(req.query, ["search", "email", "contactNumber"]);
    const paginationQuery = pick(req.query, [
      "currentPage",
      "limit",
      "sortBy",
      "sortOrder",
    ]);

    const results = await serviceFile.getAdmins(searchQuery, paginationQuery);

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Admins retrieved successfully",
      success: true,
      data: results.data,
      pagination: results.pagination,
    });
  }
);

export const getSingleAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await serviceFile.getSingleAdmin(req.params.id as string);

      return sendResponse(res, {
        code: StatusCodes.OK,
        message: "Admin retrieved successfully",
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const updateAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const results = await serviceFile.updateAdmin(req.params.id as string, req);

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Admin updated successfully",
      success: true,
      data: results,
    });
  }
);

export const deleteAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const results = await serviceFile.deleteAdmin(req.params.id as string);
    return sendResponse(res, {
      code: StatusCodes.OK,
      success: true,
      message: "Admin deleted successfully",
      data: results,
    });
  }
);

export const softDeleteAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const results = await serviceFile.softDeleteAdmin(req.params.id as string);
    return res.status(StatusCodes.OK).json({
      message: "Admin deleted successfully",
      success: true,
      data: results,
    });
  }
);
