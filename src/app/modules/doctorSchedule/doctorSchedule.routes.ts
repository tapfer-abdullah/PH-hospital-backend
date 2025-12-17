import express from "express";
import * as controllerFile from "./doctorSchedule.controller.ts";
import validateRequest from "../../middlewares/validateRequest.js";
import { doctorScheduleValidationSchemas } from "./doctorSchedule.validation.ts";
import authMiddleware from "../../middlewares/authMiddleware.ts";
import { UserRole } from "../../../../generated/prisma/enums.ts";

const route = express.Router();

route.post(
  "/",
  authMiddleware(UserRole.DOCTOR),
  validateRequest(doctorScheduleValidationSchemas.create),
  controllerFile.createSchedule
);
route.get("/", authMiddleware(UserRole.DOCTOR), controllerFile.getMySchedules);
// route.get(
//   "/:id",
//   // authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
//   controllerFile.getSingleDoctor
// );

// route.patch(
//   "/:id",
//   authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
//   uploadFile.single("profilePhoto"),
//   parseUploadedFormData,
//   validateRequest(doctorValidationSchemas.update),
//   controllerFile.updateDoctor
// );
route.delete(
  "/:id",
  authMiddleware(UserRole.DOCTOR),
  controllerFile.deleteSchedule
);
// route.delete(
//   "/:id/delete",
//   authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
//   controllerFile.softDeleteDoctor
// );

export default route;
