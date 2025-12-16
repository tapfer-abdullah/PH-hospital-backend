import express from "express";
import * as controllerFile from "./specialty.controller.ts";
import validateRequest from "../../middlewares/validateRequest.ts";
import { uploadFile } from "../../utils/multerFileUploader.ts";
import parseUploadedFormData from "../../middlewares/parseUploadedFormData.ts";
import authMiddleware from "../../middlewares/authMiddleware.ts";
import { UserRole } from "../../../../generated/prisma/enums.ts";
import { specialtyValidationSchemas } from "./specialty.validation.ts";

const route = express.Router();

route.post(
  "/",
  authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  uploadFile.single("file"),
  parseUploadedFormData,
  validateRequest(specialtyValidationSchemas.create),
  controllerFile.createSpecialty
);
route.get("/", controllerFile.getSpecialties);
route.get("/:id", controllerFile.getSingleSpecialty);

route.patch(
  "/:id",
  authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  uploadFile.single("file"),
  parseUploadedFormData,
  validateRequest(specialtyValidationSchemas.update),
  controllerFile.updateSpecialty
);
route.delete(
  "/:id",
  authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  controllerFile.deleteSpecialty
);

export default route;
