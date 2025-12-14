import express from "express";
import * as controllerFile from "./admin.controller.ts";
import { adminValidationSchemas } from "./admin.validation.ts";
import validateRequest from "../../middlewares/validateRequest.ts";
import authMiddleware from "../../middlewares/authMiddleware.ts";
import { UserRole } from "../../../../generated/prisma/enums.ts";
import { uploadFile } from "../../utils/multerFileUploader.ts";

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
  (req, res, next) => {
    const parsedData = adminValidationSchemas.update.parse({
      body: JSON.parse(req.body.data),
    });
    req.body = parsedData.body;
    next();
  },
  // validateRequest(adminValidationSchemas.update),
  controllerFile.updateAdmin
);
route.delete("/:id", controllerFile.deleteAdmin);
route.delete("/:id/delete", controllerFile.softDeleteAdmin);

export default route;
