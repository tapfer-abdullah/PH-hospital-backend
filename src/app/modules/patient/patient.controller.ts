import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as serviceFile from "./patient.service.ts";
import { sendResponse } from "../../utils/sendResponse.ts";
import catchAsync from "../../utils/catchAsync.ts";
import pick from "../../utils/pick.ts";
import { paginationFields } from "../../constraint/pagination.ts";
import { patientsFilterableFields } from "./patient.constraint.ts";

export const createPatient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await serviceFile.createPatient(req.body);
    return sendResponse(res, {
      code: StatusCodes.CREATED,
      message: "Patient created successfully",
      success: true,
      data: result,
    });
  }
);

export const getPatients = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const searchQuery = pick(req.query, patientsFilterableFields);
    const paginationQuery = pick(req.query, paginationFields);

    const results = await serviceFile.getPatients(searchQuery, paginationQuery);

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Patients retrieved successfully",
      success: true,
      data: results.data,
      pagination: results.pagination,
    });
  }
);

export const getSinglePatient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await serviceFile.getSinglePatient(
        req.params.id as string
      );

      return sendResponse(res, {
        code: StatusCodes.OK,
        message: "Patient retrieved successfully",
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const updatePatient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const results = await serviceFile.updatePatient(
      req.params.id as string,
      req
    );

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Patient updated successfully",
      success: true,
      data: results,
    });
  }
);

export const deletePatient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const results = await serviceFile.deletePatient(req.params.id as string);
    return sendResponse(res, {
      code: StatusCodes.OK,
      success: true,
      message: "Patient deleted successfully",
      data: results,
    });
  }
);

export const softDeletePatient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const results = await serviceFile.softDeletePatient(
      req.params.id as string
    );
    return res.status(StatusCodes.OK).json({
      message: "Patient deleted successfully",
      success: true,
      data: results,
    });
  }
);
