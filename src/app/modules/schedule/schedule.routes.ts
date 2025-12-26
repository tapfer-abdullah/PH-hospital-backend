import express from "express";
import * as controllerFile from "./schedule.controller.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { scheduleValidationSchemas } from "./schedule.validation.js";
import { UserRole } from "../../../../generated/prisma/enums.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

const route = express.Router();

route.post(
  "/",
  validateRequest(scheduleValidationSchemas.create),
  controllerFile.createSchedule
);
route.get(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR),
  controllerFile.getSchedules
);
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
// route.delete(
//   "/:id",
//   authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN),
//   controllerFile.deleteDoctor
// );
// route.delete(
//   "/:id/delete",
//   authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
//   controllerFile.softDeleteDoctor
// );

export default route;
