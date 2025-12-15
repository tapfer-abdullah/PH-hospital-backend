import express from "express";
import * as controllerFile from "./doctor.controller.ts";
import validateRequest from "../../middlewares/validateRequest.ts";
import { uploadFile } from "../../utils/multerFileUploader.ts";
import parseUploadedFormData from "../../middlewares/parseUploadedFormData.ts";
import authMiddleware from "../../middlewares/authMiddleware.ts";
import { UserRole } from "../../../../generated/prisma/enums.ts";
import { doctorValidationSchemas } from "./doctor.validation.ts";

const route = express.Router();

route.post(
  "/",
  authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(doctorValidationSchemas.create),
  controllerFile.createDoctor
);
route.get(
  "/",
  authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  controllerFile.getDoctors
);
route.get(
  "/:id",
  authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  controllerFile.getSingleDoctor
);

route.patch(
  "/:id",
  authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  uploadFile.single("profilePhoto"),
  parseUploadedFormData,
  validateRequest(doctorValidationSchemas.update),
  controllerFile.updateDoctor
);
route.delete(
  "/:id",
  authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  controllerFile.deleteDoctor
);
route.delete(
  "/:id/delete",
  authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  controllerFile.softDeleteDoctor
);

export default route;
