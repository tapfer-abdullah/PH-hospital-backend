import express from "express";
import * as controllerFile from "./doctor.controller.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { uploadFile } from "../../utils/multerFileUploader.js";
import parseUploadedFormData from "../../middlewares/parseUploadedFormData.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { UserRole } from "../../../../generated/prisma/enums.js";
import { doctorValidationSchemas } from "./doctor.validation.js";

const route = express.Router();

route.post(
  "/",
  authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(doctorValidationSchemas.create),
  controllerFile.createDoctor
);
route.get(
  "/",
  // authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  controllerFile.getDoctors
);
route.get(
  "/:id",
  // authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
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
