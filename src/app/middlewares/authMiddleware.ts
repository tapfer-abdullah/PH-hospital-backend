import type { NextFunction, Request, Response } from "express";
import ApiError from "../utils/apiError.ts";
import { verifyToken } from "../utils/jwtHelper.ts";
import envConfig from "../config/index.ts";

declare global {
  namespace Express {
    interface Request {
      decodedToken?: any;
      user?: any;
    }
  }
}

const authMiddleware = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return next(new ApiError(401, "Unauthorized: No token provided"));
      }

      const decodedToken = verifyToken(
        token,
        envConfig.JWT_SECRET_KEY as string
      );

      if (roles.length && !roles.includes(decodedToken.role)) {
        return next(new ApiError(403, "Forbidden: Access is denied"));
      }

      req["decodedToken"] = decodedToken;
      next();
    } catch (error) {
      next((error as Error).message || "Internal Server Error");
    }
  };
};

export default authMiddleware;
