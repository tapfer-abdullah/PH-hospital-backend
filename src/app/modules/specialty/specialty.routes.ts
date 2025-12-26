import express from "express";
import * as controllerFile from "./specialty.controller.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { uploadFile } from "../../utils/multerFileUploader.js";
import parseUploadedFormData from "../../middlewares/parseUploadedFormData.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { UserRole } from "../../../../generated/prisma/enums.js";
import { specialtyValidationSchemas } from "./specialty.validation.js";

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
