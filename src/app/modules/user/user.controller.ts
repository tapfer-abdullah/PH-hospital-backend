import type { NextFunction, Request, Response } from "express";
import * as serviceFile from "./user.service.ts";
import catchAsync from "../../utils/catchAsync.ts";
import pick from "../../utils/pick.ts";
import { userFilterableFields } from "./user.constraint.ts";
import { paginationFields } from "../../constraint/pagination.ts";
import { sendResponse } from "../../utils/sendResponse.ts";
import { StatusCodes } from "http-status-codes";

export const createUser = async (req: Request, res: Response) => {
  const data = req.body;
  const result = await serviceFile.createUser(data);

  return res.json(result);
};

export const getUser = async (req: Request, res: Response) => {
  const result = await serviceFile.getUser();
  return res.json(result);
};

export const getUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const searchQuery = pick(req.query, userFilterableFields);
    const paginationQuery = pick(req.query, paginationFields);

    const results = await serviceFile.getUsers(searchQuery, paginationQuery);

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Users retrieved successfully",
      success: true,
      data: results.data,
      pagination: results.pagination,
    });
  }
);
