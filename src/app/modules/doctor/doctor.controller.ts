import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as serviceFile from "./doctor.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import catchAsync from "../../utils/catchAsync.js";
import pick from "../../utils/pick.js";
import { doctorFilterableFields } from "./doctor.constraint.js";
import { paginationFields } from "../../constraint/pagination.js";

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
    const searchQuery = pick(req.query, doctorFilterableFields);
    const paginationQuery = pick(req.query, paginationFields);

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
