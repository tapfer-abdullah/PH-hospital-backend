import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as serviceFile from "./doctorSchedule.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import catchAsync from "../../utils/catchAsync.js";
import pick from "../../utils/pick.js";
import { paginationFields } from "../../constraint/pagination.js";
import { doctorScheduleFilterableFields } from "./doctorSchedule.constraints.js";

export const createSchedule = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await serviceFile.createSchedule(
      req.decodedToken,
      req.body.data.slots
    );
    return sendResponse(res, {
      code: StatusCodes.CREATED,
      message: "Schedule created successfully",
      success: true,
      data: result,
    });
  }
);

export const getMySchedules = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const searchQuery = pick(req.query, doctorScheduleFilterableFields);
    const paginationQuery = pick(req.query, paginationFields);

    const results = await serviceFile.getMySchedules(
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

export const deleteSchedule = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const results = await serviceFile.deleteSchedule(
      req.params.id as string,
      req.decodedToken
    );

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Schedule deleted successfully",
      success: true,
      data: results,
    });
  }
);

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
