import express from "express";
import * as controllerFile from "./admin.controller.js";
import { adminValidationSchemas } from "./admin.validation.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { uploadFile } from "../../utils/multerFileUploader.js";
import parseUploadedFormData from "../../middlewares/parseUploadedFormData.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { UserRole } from "../../../../generated/prisma/enums.js";

const route = express.Router();

route.post(
  "/",
  // authMiddleware(UserRole.SUPER_ADMIN),
  controllerFile.createAdmin
);
route.get(
  "/",
  // authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  controllerFile.getAdmins
);
route.get("/:id", controllerFile.getSingleAdmin);
route.patch(
  "/:id",
  uploadFile.single("profilePhoto"),
  parseUploadedFormData,
  validateRequest(adminValidationSchemas.update),
  controllerFile.updateAdmin
);
route.delete("/:id", controllerFile.deleteAdmin);
route.delete(
  "/:id/delete",
  authMiddleware(UserRole.SUPER_ADMIN),
  controllerFile.softDeleteAdmin
);

export default route;
