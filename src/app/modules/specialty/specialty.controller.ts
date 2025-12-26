import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as serviceFile from "./specialty.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import catchAsync from "../../utils/catchAsync.js";
import pick from "../../utils/pick.js";
import { specialtyFilterableFields } from "./specialty.constraint.js";
import { paginationFields } from "../../constraint/pagination.js";

export const createSpecialty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await serviceFile.createSpecialty(req);

    return sendResponse(res, {
      code: StatusCodes.CREATED,
      message: "Specialty created successfully",
      success: true,
      data: result,
    });
  }
);

export const getSpecialties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const searchQuery = pick(req.query, specialtyFilterableFields);
    const paginationQuery = pick(req.query, paginationFields);

    const results = await serviceFile.getSpecialties(
      searchQuery,
      paginationQuery
    );

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Specialties retrieved successfully",
      success: true,
      data: results.data,
      pagination: results.pagination,
    });
  }
);

export const getSingleSpecialty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await serviceFile.getSingleSpecialty(
        req.params.id as string
      );

      return sendResponse(res, {
        code: StatusCodes.OK,
        message: "Specialty retrieved successfully",
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const updateSpecialty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const results = await serviceFile.updateSpecialty(
      req.params.id as string,
      req
    );

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Specialty updated successfully",
      success: true,
      data: results,
    });
  }
);

export const deleteSpecialty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const results = await serviceFile.deleteSpecialty(req.params.id as string);
    return sendResponse(res, {
      code: StatusCodes.OK,
      success: true,
      message: "Specialty deleted successfully",
      data: results,
    });
  }
);
