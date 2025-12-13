import express from "express";
import * as controllerFile from "./auth.controller.ts";
import authMiddleware from "../../middlewares/authMiddleware.ts";
import { UserRole } from "../../../../generated/prisma/enums.ts";

const router = express.Router();

router.post("/refresh-token", controllerFile.refreshToken);
router.post("/login", controllerFile.login);
router.post(
  "/change-password",
  authMiddleware(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.PATIENTS,
    UserRole.DOCTOR
  ),
  controllerFile.changePassword
);

router.post("/forgot-password", controllerFile.forgotPassword);
router.post("/reset-password", controllerFile.resetPassword);

export default router;
