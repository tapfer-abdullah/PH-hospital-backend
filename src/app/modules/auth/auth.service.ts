import bcrypt from "bcrypt";

import { prisma } from "../../lib/prisma.ts";
import { generateToken, verifyToken } from "../../utils/jwtHelper.ts";
import { UserStatus } from "../../../../generated/prisma/enums.ts";

export const refreshToken = async (token: string) => {
  const verifiedToken = verifyToken(
    token,
    process.env.JWT_REFRESH_SECRET_KEY as string
  );

  const userInfo = await prisma.user.findUniqueOrThrow({
    where: { email: verifiedToken.email },
  });

  if (!userInfo || userInfo.status !== UserStatus.ACTIVE) {
    throw new Error("User not found or inactive");
  }

  const newAccessToken = generateToken(
    { email: userInfo.email, id: userInfo.id, role: userInfo.role },
    process.env.JWT_SECRET_KEY as string,
    "5m"
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
    process.env.JWT_SECRET_KEY as string,
    "5m"
  );

  const refreshToken = generateToken(
    { email: userInfo.email, id: userInfo.id, role: userInfo.role },
    process.env.JWT_REFRESH_SECRET_KEY as string,
    "30d"
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userInfo.needPasswordChange,
  };
};
