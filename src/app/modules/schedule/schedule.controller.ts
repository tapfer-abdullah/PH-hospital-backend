import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as serviceFile from "./schedule.service.ts";
import { sendResponse } from "../../utils/sendResponse.ts";
import catchAsync from "../../utils/catchAsync.ts";
import pick from "../../utils/pick.ts";
import { paginationFields } from "../../constraint/pagination.ts";
import { scheduleFilterableFields } from "./schedule.constraint.ts";

export const createSchedule = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await serviceFile.createSchedule(req.body.data);
    return sendResponse(res, {
      code: StatusCodes.CREATED,
      message: "Schedule created successfully",
      success: true,
      data: result,
    });
  }
);

export const getSchedules = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const searchQuery = pick(req.query, scheduleFilterableFields);
    const paginationQuery = pick(req.query, paginationFields);

    const results = await serviceFile.getSchedules(
      req.decodedToken,
      searchQuery,
      paginationQuery
    );

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Schedules retrieved successfully",
      success: true,
      data: results.data,
      pagination: results.pagination,
    });
  }
);

// export const getSingleDoctor = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const results = await serviceFile.getSingleDoctor(
//         req.params.id as string
//       );

//       return sendResponse(res, {
//         code: StatusCodes.OK,
//         message: "Doctor retrieved successfully",
//         success: true,
//         data: results,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// export const updateDoctor = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const results = await serviceFile.updateDoctor(
//       req.params.id as string,
//       req
//     );

//     return sendResponse(res, {
//       code: StatusCodes.OK,
//       message: "Doctor updated successfully",
//       success: true,
//       data: results,
//     });
//   }
// );

// export const deleteDoctor = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const results = await serviceFile.deleteDoctor(req.params.id as string);
//     return sendResponse(res, {
//       code: StatusCodes.OK,
//       success: true,
//       message: "Doctor deleted successfully",
//       data: results,
//     });
//   }
// );

// export const softDeleteDoctor = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const results = await serviceFile.softDeleteDoctor(req.params.id as string);
//     return res.status(StatusCodes.OK).json({
//       message: "Doctor deleted successfully",
//       success: true,
//       data: results,
//     });
//   }
// );
