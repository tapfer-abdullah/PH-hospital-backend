import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.ts";
import * as serviceFile from "./auth.service.ts";
import { sendResponse } from "../../utils/sendResponse.ts";
import { StatusCodes } from "http-status-codes";
import envConfig from "../../config/index.ts";

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
    secure: envConfig.NODE_ENV === "production",
  });

  sendResponse(res, {
    code: StatusCodes.OK,
    message: "Login successfully",
    success: true,
    data: { accessToken, needPasswordChange },
  });
});

export const changePassword = catchAsync(
  async (req: Request & { decodedToken?: any }, res: Response) => {
    const body: { oldPassword: string; newPassword: string } = req.body;
    if (!body.oldPassword || !body.newPassword) {
      throw new Error("Old password and new password are required");
    }
    const result = await serviceFile.changePassword(req.decodedToken, body);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: envConfig.NODE_ENV === "production",
    });

    sendResponse(res, {
      code: StatusCodes.OK,
      message: "Password changed successfully",
      success: true,
      data: result,
    });
  }
);

export const forgotPassword = catchAsync(
  async (req: Request, res: Response) => {
    const body: { email: string } = req.body;
    if (!body.email) {
      throw new Error("Email is required");
    }
    const result = await serviceFile.forgotPassword(body);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: envConfig.NODE_ENV === "production",
    });

    sendResponse(res, {
      code: StatusCodes.OK,
      message: "Password reset email sent successfully",
      success: true,
      data: result,
    });
  }
);

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const body: { id: string; token: string; newPassword: string } = req.body;
  if (!body.id || !body.token || !body.newPassword) {
    throw new Error("User ID, token, and new password are required");
  }
  const result = await serviceFile.resetPassword(body.token, {
    newPassword: body.newPassword,
    id: body.id,
  });

  sendResponse(res, {
    code: StatusCodes.OK,
    message: "Password reset successfully",
    success: true,
    data: result,
  });
});
