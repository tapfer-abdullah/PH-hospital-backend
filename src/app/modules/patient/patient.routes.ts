import express from "express";
import * as controllerFile from "./patient.controller.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { uploadFile } from "../../utils/multerFileUploader.js";
import parseUploadedFormData from "../../middlewares/parseUploadedFormData.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { UserRole } from "../../../../generated/prisma/enums.js";
import { patientsValidationSchemas } from "./patient.validation.js";

const route = express.Router();

route.post(
  "/",
  validateRequest(patientsValidationSchemas.create),
  controllerFile.createPatient
);
route.get(
  "/",
  // authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  controllerFile.getPatients
);
route.get(
  "/:id",
  // authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  controllerFile.getSinglePatient
);

route.patch(
  "/:id",
  authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENTS),
  //   uploadFile.single("profilePhoto"),
  uploadFile.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "medicalReports", maxCount: 10 },
  ]),
  parseUploadedFormData,
  validateRequest(patientsValidationSchemas.update),
  controllerFile.updatePatient
);

route.delete(
  "/:id",
  authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  controllerFile.deletePatient
);
route.delete(
  "/:id/delete",
  authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENTS),
  controllerFile.softDeletePatient
);

export default route;
