import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as serviceFile from "./doctor.service.ts";
import { sendResponse } from "../../utils/sendResponse.ts";
import catchAsync from "../../utils/catchAsync.ts";
import pick from "../../utils/pick.ts";

export const createDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await serviceFile.createDoctor(req.body);
    return sendResponse(res, {
      code: StatusCodes.CREATED,
      message: "Doctor created successfully",
      success: true,
      data: result,
    });
  }
);

export const getDoctors = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const searchQuery = pick(req.query, [
      "search",
      "email",
      "contactNumber",
      "currentWorkplace",
      "experience",
      "gender",
      "qualification",
      "appointmentFee",
    ]);
    const paginationQuery = pick(req.query, [
      "currentPage",
      "limit",
      "sortBy",
      "sortOrder",
    ]);

    const results = await serviceFile.getDoctors(searchQuery, paginationQuery);

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Doctors retrieved successfully",
      success: true,
      data: results.data,
      pagination: results.pagination,
    });
  }
);

export const getSingleDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await serviceFile.getSingleDoctor(
        req.params.id as string
      );

      return sendResponse(res, {
        code: StatusCodes.OK,
        message: "Doctor retrieved successfully",
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const updateDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const results = await serviceFile.updateDoctor(
      req.params.id as string,
      req
    );

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Doctor updated successfully",
      success: true,
      data: results,
    });
  }
);

export const deleteDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const results = await serviceFile.deleteDoctor(req.params.id as string);
    return sendResponse(res, {
      code: StatusCodes.OK,
      success: true,
      message: "Doctor deleted successfully",
      data: results,
    });
  }
);

export const softDeleteDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const results = await serviceFile.softDeleteDoctor(req.params.id as string);
    return res.status(StatusCodes.OK).json({
      message: "Doctor deleted successfully",
      success: true,
      data: results,
    });
  }
);
