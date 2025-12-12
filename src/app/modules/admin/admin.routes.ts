import express from "express";
import * as controllerFile from "./admin.controller.ts";
import { adminValidationSchemas } from "./admin.validation.ts";
import validateRequest from "../../middlewares/validateRequest.ts";

const route = express.Router();

route.post("/", controllerFile.createAdmin);
route.get("/", controllerFile.getAdmins);
route.get("/:id", controllerFile.getSingleAdmin);
route.patch(
  "/:id",
  validateRequest(adminValidationSchemas.update),
  controllerFile.updateAdmin
);
route.delete("/:id", controllerFile.deleteAdmin);
route.delete("/:id/delete", controllerFile.softDeleteAdmin);

export default route;
