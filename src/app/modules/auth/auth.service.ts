import bcrypt from "bcrypt";

import { prisma } from "../../lib/prisma.js";
import { generateToken, verifyToken } from "../../utils/jwtHelper.js";
import { UserStatus } from "../../../../generated/prisma/enums.js";
import envConfig from "../../config/index.js";
import type { JwtPayload } from "jsonwebtoken";
import { createForgotPasswordMailBody } from "../../utils/generateMailBod.js";
import sendMail from "../../utils/sendMail.js";

export const refreshToken = async (token: string) => {
  const verifiedToken = verifyToken(
    token,
    envConfig.JWT_REFRESH_SECRET_KEY as string
  );

  const userInfo = await prisma.user.findUniqueOrThrow({
    where: { email: verifiedToken.email },
  });

  if (!userInfo || userInfo.status !== UserStatus.ACTIVE) {
    throw new Error("User not found or inactive");
  }

  const newAccessToken = generateToken(
    { email: userInfo.email, id: userInfo.id, role: userInfo.role },
    envConfig.JWT_SECRET_KEY as string,
    envConfig.JWT_EXPIRES_IN as string
  );

  return newAccessToken;
};

export const login = async (email: string, password: string) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  const isPasswordValid = await bcrypt.compare(password, userInfo.password);

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const accessToken = generateToken(
    { email: userInfo.email, id: userInfo.id, role: userInfo.role },
    envConfig.JWT_SECRET_KEY as string,
    envConfig.JWT_EXPIRES_IN as string
  );

  const refreshToken = generateToken(
    { email: userInfo.email, id: userInfo.id, role: userInfo.role },
    envConfig.JWT_REFRESH_SECRET_KEY as string,
    envConfig.JWT_REFRESH_EXPIRES_IN as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userInfo.needPasswordChange,
  };
};

export const changePassword = async (
  decodedToken: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: { email: decodedToken.email },
  });

  const isPasswordValid = await bcrypt.compare(
    payload["oldPassword"],
    userInfo.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const hashedNewPassword = await bcrypt.hash(
    payload["newPassword"],
    envConfig.BCRYPT_SALT_ROUNDS as number
  );
  const updatedUser = await prisma.user.update({
    where: { email: decodedToken.email },
    data: { password: hashedNewPassword, needPasswordChange: false },
    select: { email: true, id: true, role: true, needPasswordChange: true },
  });

  return updatedUser;
};

export const forgotPassword = async (payload: { email: string }) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: { email: payload.email },
  });

  if (!userInfo || userInfo.status !== UserStatus.ACTIVE) {
    throw new Error("User not found or inactive");
  }

  const passwordResetToken = generateToken(
    { email: userInfo.email, id: userInfo.id, role: userInfo.role },
    envConfig.JWT_FORGOT_PASSWORD_SECRET_KEY as string,
    envConfig.JWT_FORGOT_PASSWORD_EXPIRES_IN as string
  );

  const resetPasswordLink = `${envConfig.FORGOT_PASSWORD_URL}?userId=${userInfo.id}&token=${passwordResetToken}`;

  const mailBody = createForgotPasswordMailBody(
    userInfo.email,
    resetPasswordLink
  );

  const result = await sendMail(
    userInfo.email,
    "Password Reset Request",
    mailBody
  );

  return null;
};

export const resetPassword = async (
  token: string,
  payload: { newPassword: string; id: string }
) => {
  const verifiedToken = verifyToken(
    token,
    envConfig.JWT_FORGOT_PASSWORD_SECRET_KEY as string
  );

  if (verifiedToken.id !== payload.id) {
    throw new Error("Invalid token or user ID");
  }

  const userInfo = await prisma.user.findUniqueOrThrow({
    where: { id: payload.id },
  });

  if (!userInfo || userInfo.status !== UserStatus.ACTIVE) {
    throw new Error("User not found or inactive");
  }

  const hashedNewPassword = await bcrypt.hash(
    payload.newPassword,
    envConfig.BCRYPT_SALT_ROUNDS as number
  );

  const updatedUser = await prisma.user.update({
    where: { id: payload.id },
    data: { password: hashedNewPassword, needPasswordChange: false },
    select: { email: true, id: true, role: true, needPasswordChange: true },
  });

  return null;
};
