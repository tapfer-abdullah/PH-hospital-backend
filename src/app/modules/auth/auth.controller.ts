import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.ts";
import * as serviceFile from "./auth.service.ts";
import { sendResponse } from "../../utils/sendResponse.ts";
import { StatusCodes } from "http-status-codes";

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  const newAccessToken = await serviceFile.refreshToken(refreshToken);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: "New access token generated successfully",
    success: true,
    data: { accessToken: newAccessToken },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Error("Email and Password are required");
  }
  const { accessToken, refreshToken, needPasswordChange } =
    await serviceFile.login(email, password);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  sendResponse(res, {
    code: StatusCodes.OK,
    message: "Login successfully",
    success: true,
    data: { accessToken, needPasswordChange },
  });
});
